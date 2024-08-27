import fastify from 'fastify';
import logger from './lib/common/logger';

const app = fastify({
  logger,
  ignoreTrailingSlash: true,
});

export default app;
