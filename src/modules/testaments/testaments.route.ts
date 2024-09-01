import redisStore from '@jmrl23/redis-store';
import { caching } from 'cache-manager';
import { FastifyRequest } from 'fastify';
import multer from 'fastify-multer';
import { FromSchema } from 'json-schema-to-ts';
import ms from 'ms';
import os from 'node:os';
import path from 'node:path';
import { asRoute } from '../../lib/common';
import { REDIS_URL } from '../../lib/constant/env';
import { authApiPermissionHandler } from '../auth/authPreHandler';
import { CacheService } from '../cache/cacheService';
import {
  testamentCreateSchema,
  testamentDeleteSchema,
  testamentListPayloadSchema,
  testamentSchema,
} from './testamentsSchema';
import { TestamentsService } from './testamentsService';
import { File } from 'fastify-multer/lib/interfaces';

declare module 'fastify' {
  interface FastifyRequest {
    file: File;
  }
}

export default asRoute(async function (app) {
  const testamentsService = new TestamentsService(
    new CacheService(
      await caching(
        redisStore({
          url: REDIS_URL,
          prefix: 'Portfolio:TestamentsService',
          ttl: ms('7d'),
        }),
      ),
    ),
    app.filesService,
    app.prismaClient,
  );

  const upload = multer({
    dest: path.resolve(os.tmpdir(), 'portfolio-backend'),
    limits: {
      fileSize: 20000000,
    },
  });

  await app.register(multer.contentParser);

  app

    .route({
      method: 'POST',
      url: '/create',
      config: {
        rateLimit: {
          max: 10,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'create testament',
        tags: ['testaments'],
        consumes: ['multipart/form-data'],
        body: testamentCreateSchema,
        response: {
          200: {
            description: 'testament',
            type: 'object',
            required: ['data'],
            properties: {
              data: testamentSchema,
            },
          },
        },
      },
      preValidation: [upload.single('image')],
      async handler(
        request: FastifyRequest<{
          Body: FromSchema<typeof testamentCreateSchema>;
        }>,
      ) {
        const testament = await testamentsService.createTestament({
          ...request.body,
          image: request.file,
        });
        return {
          data: testament,
        };
      },
    })

    .route({
      method: 'GET',
      url: '/key/generate',
      config: {
        rateLimit: {
          max: 20,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'generate testament key',
        security: [{ bearerAuth: [] }],
        tags: ['testaments'],
        response: {
          200: {
            description: 'testament',
            type: 'object',
            required: ['data'],
            properties: {
              data: {
                type: 'string',
                minLength: 6,
                maxLength: 6,
              },
            },
          },
        },
      },
      preHandler: [authApiPermissionHandler('testaments.write')],
      async handler() {
        const key = await testamentsService.generateKey();
        return {
          data: key,
        };
      },
    })

    .route({
      method: 'GET',
      url: '/',
      config: {
        rateLimit: {
          max: 300,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'get testaments',
        security: [{ bearerAuth: [] }],
        tags: ['testaments'],
        querystring: testamentListPayloadSchema,
        response: {
          200: {
            description: 'testaments',
            type: 'object',
            required: ['data'],
            properties: {
              data: {
                type: 'array',
                items: testamentSchema,
              },
            },
          },
        },
      },
      preHandler: [authApiPermissionHandler('testaments.read')],
      async handler(
        request: FastifyRequest<{
          Querystring: FromSchema<typeof testamentListPayloadSchema>;
        }>,
      ) {
        const testaments = await testamentsService.getTestamentsByPayload(
          request.query,
        );
        return {
          data: testaments,
        };
      },
    })

    .route({
      method: 'DELETE',
      url: '/delete/:id',
      config: {
        rateLimit: {
          max: 20,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'delete testament',
        security: [{ bearerAuth: [] }],
        tags: ['testaments'],
        querystring: testamentDeleteSchema,
        response: {
          200: {
            description: 'testament',
            type: 'object',
            required: ['data'],
            properties: {
              data: testamentSchema,
            },
          },
        },
      },
      preHandler: [authApiPermissionHandler('testaments.delete')],
      async handler(
        request: FastifyRequest<{
          Params: FromSchema<typeof testamentDeleteSchema>;
        }>,
      ) {
        const testament = await testamentsService.deleteTestamentById(
          request.params.id,
        );
        return {
          data: testament,
        };
      },
    });
});
