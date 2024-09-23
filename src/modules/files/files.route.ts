import { FastifyRequest } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import ms from 'ms';
import { asRoute } from '../../lib/common';
import { authApiPermissionHandler } from '../auth/authPreHandler';
import { filesFieldsMultiple } from './filesHandlers';
import {
  fileDeleteSchema,
  fileListPayloadSchema,
  fileSchema,
  fileUploadSchema,
} from './filesSchema';

export default asRoute(async function (app) {
  app

    .route({
      method: 'POST',
      url: '/upload',
      config: {
        rateLimit: {
          max: 50,
          timeWindow: ms('30m'),
        },
      },
      schema: {
        description: 'upload files',
        security: [{ bearerAuth: [] }],
        tags: ['files'],
        consumes: ['multipart/form-data'],
        body: fileUploadSchema,
        response: {
          200: {
            description: 'files',
            type: 'object',
            required: ['data'],
            properties: {
              data: {
                type: 'array',
                items: fileSchema,
              },
            },
          },
        },
      },
      preValidation: [
        filesFieldsMultiple(['files'], {
          files: 5,
        }),
      ],
      preHandler: [authApiPermissionHandler('files.write')],
      async handler(request) {
        const files = await request.saveRequestFiles();
        const responses = await Promise.allSettled(
          files.map((file) => this.filesService.uploadFile(file)),
        );
        const uploadedFiles = responses
          .filter((response) => response.status === 'fulfilled')
          .map((response) => response.value);
        return {
          data: uploadedFiles,
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
        description: 'get files',
        security: [{ bearerAuth: [] }],
        tags: ['files'],
        querystring: fileListPayloadSchema,
        response: {
          200: {
            description: 'files',
            type: 'object',
            required: ['data'],
            properties: {
              data: {
                type: 'array',
                items: fileSchema,
              },
            },
          },
        },
      },
      preHandler: [authApiPermissionHandler('files.read')],
      async handler(
        request: FastifyRequest<{
          Querystring: FromSchema<typeof fileListPayloadSchema>;
        }>,
      ) {
        const files = await this.filesService.getFilesByPayload(request.query);
        return {
          data: files,
        };
      },
    })

    .route({
      method: 'DELETE',
      url: '/delete',
      config: {
        rateLimit: {
          max: 50,
          timeWindow: ms('30m'),
        },
      },
      schema: {
        description: 'delete files',
        security: [{ bearerAuth: [] }],
        tags: ['files'],
        querystring: fileDeleteSchema,
        response: {
          200: {
            description: 'files',
            type: 'object',
            required: ['data'],
            properties: {
              data: {
                type: 'array',
                items: fileSchema,
              },
            },
          },
        },
      },
      preHandler: [authApiPermissionHandler('files.delete')],
      async handler(
        request: FastifyRequest<{
          Querystring: FromSchema<typeof fileDeleteSchema>;
        }>,
      ) {
        const responses = await Promise.allSettled(
          request.query.id.map((id) => this.filesService.deleteFileById(id)),
        );
        const successfulDelete = responses
          .filter((response) => response.status === 'fulfilled')
          .map((response) => response.value);
        return {
          data: successfulDelete,
        };
      },
    });
});
