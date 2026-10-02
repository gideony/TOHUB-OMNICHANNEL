const http = require('http');
const app = require('./src/app');
const socketConfig = require('./src/socket/io');
const env = require('./src/config/env');

const server = http.createServer(app);

socketConfig.init(server);

server.listen(env.PORT, () => {
  console.log(`
  🚀 JULES Backend rodando!
  📡 http://localhost:${env.PORT}
  💻 Health: GET /health
  `);
});
