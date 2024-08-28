import redisStore from '@jmrl23/redis-store';
import { caching } from 'cache-manager';
import { FastifyRequest } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import ms from 'ms';
import { asRoute } from '../../lib/common';
import { REDIS_URL } from '../../lib/constant/env';
import { CacheService } from '../cache/cacheService';
import {
  projectCreateSchema,
  projectSchema,
  projectUpdateImagesSchema,
} from './projectsSchema';
import { ProjectsService } from './projectsService';
import { authKeyPreHandler } from '../auth/authKeyPreHandler';

export default asRoute(async function (app) {
  const projectsService = new ProjectsService(
    new CacheService(
      await caching(
        redisStore({
          url: REDIS_URL,
          ttl: ms('10m'),
        }),
      ),
    ),
    app.filesService,
    app.prismaClient,
  );

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
      preHandler: [authKeyPreHandler],
      async handler(
        request: FastifyRequest<{
          Body: FromSchema<typeof projectCreateSchema>;
        }>,
      ) {
        const project = await projectsService.createProject(request.body);
        return {
          data: project,
        };
      },
    })

    .route({
      method: 'POST',
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
      preHandler: [authKeyPreHandler],
      async handler(
        request: FastifyRequest<{
          Body: FromSchema<typeof projectUpdateImagesSchema>;
        }>,
      ) {
        const { id, ...body } = request.body;
        const project = await projectsService.updateProjectById(id, body);
        return {
          data: project,
        };
      },
    });
});
