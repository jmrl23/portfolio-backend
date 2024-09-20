import { FastifyRequest } from 'fastify';
import multer from 'fastify-multer';
import { FromSchema } from 'json-schema-to-ts';
import ms from 'ms';
import os from 'node:os';
import path from 'node:path';
import { asRoute } from '../../lib/common';
import { authApiPermissionHandler } from '../auth/authPreHandler';
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
    app.cacheService,
    app.prismaClient,
    app.filesService,
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
          max: 50,
          timeWindow: ms('30m'),
        },
      },
      schema: {
        description: 'create project',
        security: [{ bearerAuth: [] }],
        tags: ['projects'],
        consumes: ['multipart/form-data'],
        body: projectCreateSchema,
        response: {
          200: {
            description: 'project',
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
        const project = await projectsService.createProject({
          ...request.body,
          images: request.files,
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
          max: 300,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'get projects',
        security: [{ bearerAuth: [] }],
        tags: ['projects'],
        querystring: projectListPayloadSchema,
        response: {
          200: {
            description: 'projects',
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
          max: 10,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'update project',
        security: [{ bearerAuth: [] }],
        tags: ['projects'],
        body: projectUpdateSchema,
        response: {
          200: {
            description: 'project',
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
      url: '/images/update/:id',
      config: {
        rateLimit: {
          max: 10,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'update project images',
        security: [{ bearerAuth: [] }],
        tags: ['projects'],
        consumes: ['multipart/form-data'],
        params: projectUpdateImagesSchema.properties.params,
        body: projectUpdateImagesSchema.properties.body,
        response: {
          200: {
            description: 'project',
            type: 'object',
            required: ['data'],
            properties: {
              data: projectSchema,
            },
          },
        },
      },
      preValidation: [upload.array('upload', 20)],
      preHandler: [authApiPermissionHandler('projects.write')],
      async handler(
        request: FastifyRequest<{
          Params: FromSchema<
            typeof projectUpdateImagesSchema.properties.params
          >;
          Body: FromSchema<typeof projectUpdateImagesSchema.properties.body>;
        }>,
      ) {
        const project = await projectsService.updateProjectImagesById(
          request.params.id,
          { ...request.body, upload: request.files },
        );
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
          timeWindow: ms('30m'),
        },
      },
      schema: {
        description: 'delete project',
        security: [{ bearerAuth: [] }],
        tags: ['projects'],
        params: projectDeleteSchema,
        response: {
          200: {
            description: 'project',
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
