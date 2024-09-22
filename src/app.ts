import fastify from 'fastify';
import logger from './lib/common/logger';

const app = fastify({
  loggerInstance: logger,
  ignoreTrailingSlash: true,
});

export default app;
