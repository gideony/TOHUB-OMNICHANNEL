const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.post('/', async (req, res) => {
  console.log('📨 WhatsApp Webhook:', req.body);

  // Parse simple payload format for testing purposes
  const { message, from, timestamp } = req.body;

  if (message && from) {
    try {
      // 1. Check or create contact
      let { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('phone', from)
        .single();

      if (contactError && contactError.code === 'PGRST116') { // Not found
        const { data: newContact, error: createError } = await supabase
          .from('contacts')
          .insert([{ phone: from, name: from, source: 'whatsapp' }])
          .select()
          .single();

        if (createError) throw createError;
        contact = newContact;
      } else if (contactError) {
        throw contactError;
      }

      // 2. Save message
      const { data: savedMessage, error: messageError } = await supabase
        .from('messages')
        .insert([{
          contact_id: contact.id,
          channel: 'whatsapp',
          sender_type: 'contact',
          body: message,
          direction: 'in',
          status: 'delivered'
        }])
        .select()
        .single();

      if (messageError) throw messageError;

      // 3. Emit via Socket.io
      const io = req.app.get('io');
      if (io) {
          io.emit('new_message', savedMessage);
      }

      return res.json({ received: true, message: savedMessage });
    } catch (err) {
      console.error('Error handling webhook:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Handle Meta API format if needed later, for now just acknowledge
  res.json({ received: true });
});

module.exports = router;
