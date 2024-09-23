import fastifyMultipart from '@fastify/multipart';
import fastifyPlugin from 'fastify-plugin';

export default fastifyPlugin(async function (app) {
  await app.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: {
      fileSize: 20_000_000,
    },
  });
});
