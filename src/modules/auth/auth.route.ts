import { FastifyRequest } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import ms from 'ms';
import { asRoute } from '../../lib/common';
import { authApiRequiredMasterHandler } from './authPreHandler';
import {
  authApiKeyCreateSchema,
  authApiKeyGetInfoSchema,
  authApiKeyRevokeSchema,
  authApiKeySchema,
} from './authSchema';

export default asRoute(async function (app) {
  app

    .route({
      method: 'POST',
      url: '/create',
      config: {
        rateLimit: {
          max: 5,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'create auth api key',
        security: [{ bearerAuth: [] }],
        tags: ['auth'],
        body: authApiKeyCreateSchema,
        response: {
          200: {
            description: 'auth api key',
            type: 'object',
            required: ['data'],
            properties: {
              data: authApiKeySchema,
            },
          },
        },
      },
      preHandler: [authApiRequiredMasterHandler],
      async handler(
        request: FastifyRequest<{
          Body: FromSchema<typeof authApiKeyCreateSchema>;
        }>,
      ) {
        const key = await this.authService.createAuthApiKey(request.body);
        return {
          data: key,
        };
      },
    })

    .route({
      method: 'GET',
      url: '/:key',
      config: {
        rateLimit: {
          max: 60,
          timeWindow: ms('1m'),
        },
      },
      schema: {
        description: 'auth api key',
        security: [{ bearerAuth: [] }],
        tags: ['auth'],
        params: authApiKeyGetInfoSchema,
        response: {
          200: {
            description: 'auth api key',
            type: 'object',
            required: ['data'],
            properties: {
              data: authApiKeySchema,
            },
          },
        },
      },
      preHandler: [authApiRequiredMasterHandler],
      async handler(
        request: FastifyRequest<{
          Params: FromSchema<typeof authApiKeyGetInfoSchema>;
        }>,
      ) {
        const key = await this.authService.getAuthApiKeyInfoByKey(
          request.params.key,
        );
        return {
          data: key,
        };
      },
    })

    .route({
      method: 'DELETE',
      url: '/revoke/:id',
      config: {
        rateLimit: {
          max: 20,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'revoke auth api key',
        security: [{ bearerAuth: [] }],
        tags: ['auth'],
        params: authApiKeyRevokeSchema,
        response: {
          200: {
            description: 'auth api key',
            type: 'object',
            required: ['data'],
            properties: {
              data: authApiKeySchema,
            },
          },
        },
      },
      preHandler: [authApiRequiredMasterHandler],
      async handler(
        request: FastifyRequest<{
          Params: FromSchema<typeof authApiKeyRevokeSchema>;
        }>,
      ) {
        const key = await this.authService.revokeAuthApiKeyById(
          request.params.id,
        );
        return {
          data: key,
        };
      },
    });
});
