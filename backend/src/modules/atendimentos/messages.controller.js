const supabase = require('../../config/supabase');
const socketConfig = require('../../socket/io');

exports.getMessages = async (req, res) => {
  const { contact_id } = req.params;

  if (!contact_id) {
    return res.status(400).json({ error: 'contact_id é obrigatório' });
  }

  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('contact_id', contact_id)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(messages);
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

exports.sendMessage = async (req, res) => {
  const { contact_id, body, channel, sender_id } = req.body;

  if (!contact_id || !body || !channel) {
    return res.status(400).json({ error: 'contact_id, body e channel são obrigatórios' });
  }

  try {
    // Salva a mensagem no banco de dados como enviada por um agente
    const { data: savedMessage, error } = await supabase
      .from('messages')
      .insert([{
        contact_id,
        channel,
        sender_type: 'agent',
        sender_id: req.user ? req.user.id : sender_id,
        body,
        direction: 'out',
        status: 'pending' // Em produção usaríamos a API do WhatsApp para confirmar o envio
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Emite o evento Socket.io (útil se o frontend precisa se atualizar com a mensagem do agente)
    try {
      const io = socketConfig.getIo();
      io.emit('new_message', savedMessage);
    } catch (ioError) {
      console.error('Erro ao emitir evento Socket.io:', ioError);
    }

    // TODO: Integração real com API Oficial do WhatsApp/Ahá para efetivamente enviar a mensagem ao contato
    console.log(`[FAKE SEND] Simulando envio no canal ${channel} para contato ${contact_id}: "${body}"`);

    res.status(201).json(savedMessage);
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
