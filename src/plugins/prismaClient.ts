import { PrismaClient } from '@prisma/client';
import fastifyPlugin from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    prismaClient: PrismaClient;
  }
}

export default fastifyPlugin(async function (app) {
  const prismaClient = new PrismaClient();

  app.decorate('prismaClient', prismaClient);
});
