require('dotenv').config()

const http = require('http')
const socketIo = require('socket.io')
const app = require('./src/app')

const server = http.createServer(app)

// Socket.io Setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Store io no app para usar em outros módulos
app.set('io', io)

// Socket.io Connections
io.on('connection', (socket) => {
  console.log('✅ Client conectado:', socket.id)

  // Echo test
  socket.on('ping', (data) => {
    socket.emit('pong', { received: data, timestamp: new Date() })
  })

  socket.on('disconnect', () => {
    console.log('❌ Client desconectado:', socket.id)
  })
})

// Start Server
const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 TOHUB BACKEND INICIADO!          ║
╠════════════════════════════════════════╣
║ 📡 Servidor: http://localhost:${PORT}     ║
║ 🔌 Socket.io: ws://localhost:${PORT}     ║
║ 📊 Health: GET /health                 ║
║ 🔌 Status: GET /api/status             ║
╚════════════════════════════════════════╝
  `)
})

module.exports = { server, io }
