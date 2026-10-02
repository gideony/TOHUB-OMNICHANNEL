const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const socketConfig = require('../socket/io');

router.post('/', async (req, res) => {
  console.log('📨 WhatsApp Webhook recebido:', req.body);

  // Para MVP: formato simplificado
  // { "message": "Olá", "from": "5585987654321" }
  const { message, from, timestamp } = req.body;

  // Responde rápido para o webhook não dar timeout
  res.json({ received: true });

  if (message && from) {
    try {
      // 1. Verifica se o contato existe ou cria
      let contactId;
      const { data: contacts, error: contactSearchError } = await supabase
        .from('contacts')
        .select('id')
        .eq('phone', from)
        .eq('source', 'whatsapp')
        .limit(1);

      if (contactSearchError) {
        console.error('Erro ao buscar contato:', contactSearchError);
        return;
      }

      if (contacts && contacts.length > 0) {
        contactId = contacts[0].id;
      } else {
        // Cria contato novo
        const { data: newContact, error: insertError } = await supabase
          .from('contacts')
          .insert([{
            phone: from,
            name: from, // Nome placeholder até que o agente edite ou chegue pela API oficial
            source: 'whatsapp'
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao criar contato:', insertError);
          return;
        }
        contactId = newContact.id;
      }

      // 2. Salva a mensagem no banco de dados
      const { data: savedMessage, error: msgError } = await supabase
        .from('messages')
        .insert([{
          contact_id: contactId,
          channel: 'whatsapp',
          sender_type: 'contact',
          body: message,
          direction: 'in',
          status: 'delivered'
        }])
        .select()
        .single();

      if (msgError) {
        console.error('Erro ao salvar mensagem:', msgError);
        return;
      }

      console.log('✅ Mensagem salva:', savedMessage);

      // 3. Emite evento via Socket.io
      try {
        const io = socketConfig.getIo();
        io.emit('new_message', savedMessage);
      } catch (ioError) {
        console.error('Erro ao emitir evento Socket.io:', ioError);
      }

    } catch (err) {
      console.error('Erro processando webhook WhatsApp:', err);
    }
  } else {
    console.log('Webhook payload inválido ou sem message/from. Apenas ignorando.');
  }
});

module.exports = router;
