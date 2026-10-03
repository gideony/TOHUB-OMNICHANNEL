require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./src/modules/auth/auth.routes');
const messagesRoutes = require('./src/modules/atendimentos/messages.routes');
const whatsappWebhook = require('./src/webhooks/whatsapp');

// Register routes
app.use('/auth', authRoutes);
app.use('/messages', messagesRoutes);
app.use('/webhooks/whatsapp', whatsappWebhook);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('✅ Client conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client desconectado:', socket.id);
  });
});

// Start
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
  🚀 JULES Backend rodando!
  📡 http://localhost:${PORT}
  💻 API: POST /webhooks/whatsapp
  `);
});
