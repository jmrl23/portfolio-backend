import './init';
import * as c from 'colorette';
import detectPort from 'detect-port';
import app from './app';
import bootstrap from './bootstrap';
import { logger } from './lib/common';
import { PORT, SERVER_HOST } from './lib/constant/env';

async function main() {
  const host = SERVER_HOST;
  const port = await detectPort(PORT);

  await app.register(bootstrap);

  app.listen({ host, port }, function (error) {
    if (error) return logger.error(error.stack ?? error.message);
    logger.info(`${c.bold('server port')} ${port}`);
  });
}

void main();
