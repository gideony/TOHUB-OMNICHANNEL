const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware');
const supabase = require('../../config/supabase');

router.get('/:contact_id', authMiddleware, async (req, res) => {
    try {
        const { contact_id } = req.params;
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('contact_id', contact_id)
            .order('created_at', { ascending: true });

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { contact_id, body, channel } = req.body;

        // 1. Save to Supabase
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                contact_id,
                channel: channel || 'whatsapp',
                sender_type: 'agent',
                sender_id: req.user.id,
                body,
                direction: 'out',
                status: 'pending'
            }])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // 2. Here would go the integration to actually send the message via WhatsApp API
        // ...

        // 3. Emit via socket
        const io = req.app.get('io');
        if (io) {
            io.emit('new_message', data);
        }

        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
