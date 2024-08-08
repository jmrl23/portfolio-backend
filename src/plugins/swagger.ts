import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyPlugin from 'fastify-plugin';
import type { OpenAPIV3_1 } from 'openapi-types';
import { PRODUCTION_URL } from '../lib/constant/env';
import fs from 'node:fs';
import path from 'node:path';

export default fastifyPlugin(async function swagger(app) {
  const servers: OpenAPIV3_1.ServerObject[] = [
    {
      url: 'http://localhost:3001',
      description: 'Default local development server',
    },
  ];

  if (PRODUCTION_URL) {
    servers.unshift({
      url: PRODUCTION_URL,
      description: 'Production server',
    });
  }

  const packageJson = fs
    .readFileSync(path.resolve(__dirname, '../../package.json'))
    .toString();
  const version: string = JSON.parse(packageJson)?.version ?? '0.0.0';

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
        // securitySchemes: {
        //   bearerAuth: {
        //     type: 'http',
        //     scheme: 'bearer',
        //     bearerFormat: 'JWT',
        //   },
        // },
      },
    },
  });

  await app.register(fastifySwaggerUi, { routePrefix: '/docs' });
});
