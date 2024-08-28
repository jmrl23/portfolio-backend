const fastify = require('fastify');
const app = fastify();
/** @type {import('fastify-plugin').default} */
const bootstrap = require('../build/bootstrap');

app.register(bootstrap);

/**
 * @param {import('node:http').IncomingMessage} request
 * @param {import('node:http').ServerResponse} response
 * */
async function handler(request, response) {
  await app.ready();
  app.server.emit('request', request, response);
}

module.exports = handler;
