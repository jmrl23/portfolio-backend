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
  projectDeleteSchema,
  projectListPayloadSchema,
  projectSchema,
  projectUpdateImagesSchema,
  projectUpdateSchema,
} from './projectsSchema';
import { ProjectsService } from './projectsService';
import { authApiPermissionHandler } from '../auth/authPreHandler';

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
      preHandler: [authApiPermissionHandler('projects.write')],
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
