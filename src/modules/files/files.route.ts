import { FastifyRequest } from 'fastify';
import multer from 'fastify-multer';
import { File } from 'fastify-multer/lib/interfaces';
import { FromSchema } from 'json-schema-to-ts';
import ms from 'ms';
import os from 'node:os';
import path from 'node:path';
import { asRoute } from '../../lib/common';
import {
  fileDeleteSchema,
  fileListPayloadSchema,
  fileSchema,
  fileUploadSchema,
} from './filesSchema';
import { authApiPermissionHandler } from '../auth/authPreHandler';

declare module 'fastify' {
  interface FastifyRequest {
    files: File[];
  }
}

export default asRoute(async function (app) {
  const upload = multer({
    dest: path.resolve(os.tmpdir(), 'portfolio-backend'),
    limits: {
      fileSize: 20480,
    },
  });

  await app.register(multer.contentParser);

  app

    .route({
      method: 'POST',
      url: '/upload',
      config: {
        rateLimit: {
          max: 5,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'Upload files',
        security: [{ bearerAuth: [] }],
        tags: ['files'],
        consumes: ['multipart/form-data'],
        body: fileUploadSchema,
        response: {
          200: {
            description: 'List of uploaded files',
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
        async function (request) {
          request.body = {
            files: [],
          };
        },
      ],
      preHandler: [
        authApiPermissionHandler('files.write'),
        upload.array('files', 5),
      ],
      async handler(request) {
        if (request.files === undefined) {
          request.files = [];
        }
        const responses = await Promise.allSettled(
          request.files.map((file) => this.filesService.uploadFile(file)),
        );
        const successfulUploads = responses
          .filter((response) => response.status === 'fulfilled')
          .map((response) => response.value);
        return {
          data: successfulUploads,
        };
      },
    })

    .route({
      method: 'GET',
      url: '/',
      config: {
        rateLimit: {
          max: 60,
          timeWindow: ms('1m'),
        },
      },
      schema: {
        description: 'Get list of files',
        tags: ['files'],
        querystring: fileListPayloadSchema,
        response: {
          200: {
            description: 'List of files',
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
          max: 15,
          timeWindow: ms('1m'),
        },
      },
      schema: {
        description: 'Delete files',
        security: [{ bearerAuth: [] }],
        tags: ['files'],
        querystring: fileDeleteSchema,
        response: {
          200: {
            description: 'List of deleted files',
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
