const express = require('express');
const cors = require('cors');
const env = require('./config/env');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const messagesRoutes = require('./modules/atendimentos/messages.routes');
const whatsappWebhook = require('./webhooks/whatsapp');

const app = express();

app.use(cors({
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/messages', messagesRoutes);

// Webhooks
app.use('/webhooks/whatsapp', whatsappWebhook);

module.exports = app;
