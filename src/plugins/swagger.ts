import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyPlugin from 'fastify-plugin';
import fs from 'node:fs';
import path from 'node:path';
import { OpenAPIV3_1 } from 'openapi-types';
import { PRODUCTION_URL } from '../lib/constant/env';

export default fastifyPlugin(async function (app) {
  const packageJson: Record<string, unknown> = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../package.json')).toString(),
  );
  const version: string =
    typeof packageJson.version === 'string' ? packageJson.version : '0.0.0';

  const servers: OpenAPIV3_1.ServerObject[] = [
    {
      url: 'http://localhost:3001',
      description: 'Default local development server',
    },
  ];

  if (PRODUCTION_URL !== undefined) {
    let url = PRODUCTION_URL;
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }

    servers.unshift({
      url,
      description: 'Production server',
    });
  }

  await app.register(fastifySwagger, {
    prefix: '/docs',
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Rest API',
        version,
      },
      servers,
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
          },
        },
      },
    },
  });

  await app.register(fastifySwaggerUi, { routePrefix: '/docs' });
});
