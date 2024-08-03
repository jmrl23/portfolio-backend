import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import * as c from 'colorette';
import type { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { NotFound } from 'http-errors';
import path from 'node:path';
import { logger } from './lib/common';
import middleware from './plugins/middleware';
import routes from './plugins/routes';
import swagger from './plugins/swagger';
import fastifyRateLimit from '@fastify/rate-limit';
import ms from 'ms';

export default fastifyPlugin(async function bootstrap(app) {
  await app.register(middleware);

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
        logger.info(`${c.bold('registered route')} ${route}`);
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
