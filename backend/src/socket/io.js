const socketIo = require('socket.io');
const env = require('../config/env');

let io;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: env.FRONTEND_URL,
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('✅ Client conectado:', socket.id);

      socket.on('disconnect', () => {
        console.log('❌ Client desconectado:', socket.id);
      });
    });

    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io não foi inicializado!');
    }
    return io;
  }
};
