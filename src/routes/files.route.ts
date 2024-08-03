import { FastifyRequest } from 'fastify';
import multer from 'fastify-multer';
import { File } from 'fastify-multer/lib/interfaces';
import { BadRequest } from 'http-errors';
import fs from 'node:fs';
import os from 'node:os';
import { asRoute } from '../lib/common';
import { fileStore } from '../lib/imagekit';
import {
  FileDelete,
  fileDeleteSchema,
  FileListPayload,
  fileListPayloadSchema,
  fileSchema,
  fileUploadSchema,
} from '../schemas/file';
import FileStorageService from '../services/FileStorageService';
import redisStore from '@jmrl23/redis-store';
import { REDIS_URL } from '../lib/constant/env';
import CacheService from '../services/CacheService';
import { caching } from 'cache-manager';
import ms from 'ms';

export const prefix = '/files';

declare module 'fastify' {
  interface FastifyRequest {
    files: File[];
  }
}

export default asRoute(async function fileRoute(app) {
  const cacheStore = redisStore({
    url: REDIS_URL,
    prefix: 'PortfolioBackend:FileStoreService',
    ttl: ms('1m'),
  });
  const cacheService = new CacheService(await caching(cacheStore));
  const fileStorageService = new FileStorageService(cacheService, fileStore);
  const upload = multer({
    dest: os.tmpdir(),
  });

  await app.register(multer.contentParser);

  app

    .route({
      method: 'POST',
      url: '/upload',
      schema: {
        description: 'Upload files',
        tags: ['files'],
        consumes: ['multipart/form-data'],
        body: fileUploadSchema,
        response: {
          200: {
            description: 'List of uploaded files',
            type: 'object',
            required: ['files'],
            properties: {
              files: {
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
      preHandler: [upload.array('files', 5)],
      async handler(request) {
        if (request.files === undefined) {
          request.files = [];
        }
        const settledResults = await Promise.allSettled(
          request.files.map(async (file) => {
            const filePath = file.path;
            if (!filePath) throw BadRequest('No filepath');
            const buffer = fs.readFileSync(filePath);
            return await fileStorageService.upload(buffer, file.originalname);
          }),
        );
        const files = settledResults
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value);
        return {
          files,
        };
      },
    })

    .route({
      method: 'delete',
      url: '/delete',
      schema: {
        description: 'Delete file',
        tags: ['files'],
        querystring: fileDeleteSchema,
        response: {
          200: {
            description: "List of deleted files' id",
            type: 'object',
            required: ['ids'],
            properties: {
              ids: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      async handler(
        request: FastifyRequest<{
          Querystring: FileDelete;
        }>,
      ) {
        const settledResults = await Promise.allSettled(
          request.query.ids.map(
            fileStorageService.delete.bind(fileStorageService),
          ),
        );
        const ids = settledResults
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value);

        return {
          ids,
        };
      },
    })

    .route({
      method: 'get',
      url: '',
      schema: {
        description: 'Get list of files',
        tags: ['files'],
        querystring: fileListPayloadSchema,
        response: {
          200: {
            description: 'List of files',
            type: 'object',
            required: ['files'],
            properties: {
              files: {
                type: 'array',
                items: fileSchema,
              },
            },
          },
        },
      },
      async handler(
        request: FastifyRequest<{
          Querystring: FileListPayload;
        }>,
      ) {
        const files = await fileStorageService.get(request.query);
        return {
          files,
        };
      },
    });
});
