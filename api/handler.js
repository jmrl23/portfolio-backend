const fastify = require('fastify');
const app = fastify();

app.register(require('../build/bootstrap'));

async function handler(request, response) {
  await app.ready();
  app.server.emit('request', request, response);
}

module.exports = handler;
