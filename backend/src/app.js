const express = require('express')
const cors = require('cors')

const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Status API
app.get('/api/status', (req, res) => {
  res.json({
    server: 'running',
    timestamp: new Date(),
    uptime: process.uptime()
  })
})

// Importar rotas
const authRoutes = require('./modules/auth/auth.routes')
const messagesRoutes = require('./modules/atendimentos/messages.routes')
const whatsappWebhook = require('./webhooks/whatsapp')

// Registrar rotas
app.use('/auth', authRoutes)
app.use('/messages', messagesRoutes)

// GET para verificação de webhook
app.get('/webhooks/whatsapp', whatsappWebhook.verifyWebhook)

// POST para receber mensagens
app.post('/webhooks/whatsapp', whatsappWebhook.handleWebhook)

console.log('✅ Todas as rotas registradas')

module.exports = app
