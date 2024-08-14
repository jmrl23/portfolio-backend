import './init';
import detectPort from 'detect-port';
import app from './app';
import bootstrap from './bootstrap';
import { PORT } from './lib/constant/env';

async function main() {
  const host = '0.0.0.0';
  const port = await detectPort(PORT);

  await app.register(bootstrap);

  app.listen({
    host,
    port,
    listenTextResolver: () => `listening on port ${port}`,
  });
}

void main();
