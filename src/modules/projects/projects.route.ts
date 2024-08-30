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
  projectCreateSchema,
  projectDeleteSchema,
  projectListPayloadSchema,
  projectSchema,
  projectUpdateImagesSchema,
  projectUpdateSchema,
} from './projectsSchema';
import { ProjectsService } from './projectsService';

export default asRoute(async function (app) {
  const projectsService = new ProjectsService(
    new CacheService(
      await caching(
        redisStore({
          url: REDIS_URL,
          ttl: ms('5m'),
        }),
      ),
    ),
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
          max: 5,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'Create a project',
        security: [{ bearerAuth: [] }],
        tags: ['projects'],
        consumes: ['multipart/form-data'],
        body: projectCreateSchema,
        response: {
          200: {
            description: 'Created project',
            type: 'object',
            required: ['data'],
            properties: {
              data: projectSchema,
            },
          },
        },
      },
      preValidation: [upload.array('images', 20)],
      preHandler: [authApiPermissionHandler('projects.write')],
      async handler(
        request: FastifyRequest<{
          Body: FromSchema<typeof projectCreateSchema>;
        }>,
      ) {
        if (request.files === undefined) {
          request.files = [];
        }
        const responses = await Promise.allSettled(
          request.files.map((file) => this.filesService.uploadFile(file)),
        );
        const images = responses
          .filter((response) => response.status === 'fulfilled')
          .map((response) => response.value);
        const project = await projectsService.createProject({
          ...request.body,
          images: images.map((image) => image.id),
        });
        return {
          data: project,
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
        description: 'Get list of projects',
        security: [{ bearerAuth: [] }],
        tags: ['projects'],
        querystring: projectListPayloadSchema,
        response: {
          200: {
            description: 'List of projects',
            type: 'object',
            required: ['data'],
            properties: {
              data: {
                type: 'array',
                items: projectSchema,
              },
            },
          },
        },
      },
      preHandler: [authApiPermissionHandler('projects.read')],
      async handler(
        request: FastifyRequest<{
          Querystring: FromSchema<typeof projectListPayloadSchema>;
        }>,
      ) {
        const projects = await projectsService.getProjectsByPayload(
          request.query,
        );
        return {
          data: projects,
        };
      },
    })

    .route({
      method: 'PATCH',
      url: '/update',
      config: {
        rateLimit: {
          max: 5,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'Update project',
        security: [{ bearerAuth: [] }],
        tags: ['projects'],
        body: projectUpdateSchema,
        response: {
          200: {
            description: 'Updated project',
            type: 'object',
            required: ['data'],
            properties: {
              data: projectSchema,
            },
          },
        },
      },
      preHandler: [authApiPermissionHandler('projects.write')],
      async handler(
        request: FastifyRequest<{
          Body: FromSchema<typeof projectUpdateSchema>;
        }>,
      ) {
        const { id, ...body } = request.body;
        const project = await projectsService.updateProjectById(id, body);
        return {
          data: project,
        };
      },
    })

    .route({
      method: 'PATCH',
      url: '/update-images',
      config: {
        rateLimit: {
          max: 5,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'Update project images',
        security: [{ bearerAuth: [] }],
        tags: ['projects'],
        body: projectUpdateImagesSchema,
        response: {
          200: {
            description: 'Updated project',
            type: 'object',
            required: ['data'],
            properties: {
              data: projectSchema,
            },
          },
        },
      },
      preHandler: [authApiPermissionHandler('projects.write')],
      async handler(
        request: FastifyRequest<{
          Body: FromSchema<typeof projectUpdateImagesSchema>;
        }>,
      ) {
        const { id, ...body } = request.body;
        const project = await projectsService.updateProjectImagesById(id, body);
        return {
          data: project,
        };
      },
    })

    .route({
      method: 'DELETE',
      url: '/delete/:id',
      config: {
        rateLimit: {
          max: 50,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'Delete a project',
        security: [{ bearerAuth: [] }],
        tags: ['projects'],
        params: projectDeleteSchema,
        response: {
          200: {
            description: 'Deleted project',
            type: 'object',
            required: ['data'],
            properties: {
              data: projectSchema,
            },
          },
        },
      },
      preHandler: [authApiPermissionHandler('projects.delete')],
      async handler(
        request: FastifyRequest<{
          Params: FromSchema<typeof projectDeleteSchema>;
        }>,
      ) {
        const project = await projectsService.deleteProjectById(
          request.params.id,
        );
        return {
          data: project,
        };
      },
    });
});
