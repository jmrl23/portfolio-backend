import fastifyMiddie from '@fastify/middie';
import * as c from 'colorette';
import fastifyPlugin from 'fastify-plugin';
import morgan from 'morgan';
import { logger } from '../lib/common';

export default fastifyPlugin(async function middleware(app) {
  await app.register(fastifyMiddie, { prefix: '/' });

  app.use(morganMiddleware);
});

const morganMiddleware = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write(message) {
        logger.http(`${c.bold('morgan')} ${c.gray(message.trim())}`);
      },
    },
  },
);
