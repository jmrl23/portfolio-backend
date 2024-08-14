import fastifyCors from '@fastify/cors';
import fastifyEtag from '@fastify/etag';
import fastifyMiddie from '@fastify/middie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { NotFound } from 'http-errors';
import ms from 'ms';
import path from 'node:path';
import { logger } from './lib/common';
import routes from './plugins/routes';
import swagger from './plugins/swagger';

export default fastifyPlugin(async function bootstrap(app) {
  await app.register(fastifyEtag);

  await app.register(fastifyMiddie);

  await app.register(fastifyCors, {
    origin: '*',
  });

  await app.register(fastifyRateLimit, {
    max: 50,
    timeWindow: ms('1m'),
  });

  await app.register(swagger);

  await app.register(routes, {
    dirPath: path.resolve(__dirname, './routes'),
    callback(routes) {
      for (const route of routes) {
        logger.info(`registered route {${route}}`);
      }
    },
  });

  await app.register(fastifyStatic, {
    root: path.resolve(__dirname, '../public'),
  });

  await postConfigurations(app);
});

async function postConfigurations(app: FastifyInstance) {
  app.setNotFoundHandler(async function notFoundHandler(request) {
    throw new NotFound(`Cannot ${request.method} ${request.url}`);
  });

  app.setErrorHandler(async function errorHandler(error) {
    if (!error.statusCode || error.statusCode > 499) {
      logger.error(error.stack ?? error.message);
    }
    return error;
  });
}
