import redisStore from '@jmrl23/redis-store';
import { caching } from 'cache-manager';
import { FastifyRequest } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import ms from 'ms';
import { asRoute } from '../../lib/common';
import { CORS_ORIGIN, REDIS_URL } from '../../lib/constant/env';
import { authApiPermissionHandler } from '../auth/authPreHandler';
import { CacheService } from '../cache/cacheService';
import {
  testimonialCreateSchema,
  testimonialDeleteSchema,
  testimonialListPayloadSchema,
  testimonialSchema,
} from './testimonialsSchema';
import { TestimonialsService } from './testimonialsService';

export default asRoute(async function (app) {
  const testimonialsService = new TestimonialsService(
    new CacheService(
      await caching(
        redisStore({
          url: REDIS_URL,
          prefix: 'Portfolio:TestimonialsService',
          ttl: ms('7d'),
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
          max: 10,
          timeWindow: ms('5m'),
        },
      },
      schema: {
        description: 'create testimonial',
        tags: ['testimonials'],
        consumes: ['multipart/form-data'],
        body: testimonialCreateSchema,
        response: {
          200: {
            description: 'testimonial',
            type: 'object',
            required: ['data'],
            properties: {
              data: testimonialSchema,
            },
          },
        },
      },
      async handler(
        request: FastifyRequest<{
          Body: FromSchema<typeof testimonialCreateSchema>;
        }>,
      ) {
        const files = await request.saveRequestFiles({
          limits: { files: 1 },
        });
        const testimonial = await testimonialsService.createTestimonial({
          ...request.body,
          image: files[0],
        });
        return {
          data: testimonial,
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
        description: 'generate testimonial key',
        security: [{ bearerAuth: [] }],
        tags: ['testimonials'],
        response: {
          200: {
            description: 'testimonial',
            type: 'object',
            required: ['data'],
            properties: {
              data: {
                type: 'object',
                required: ['key', 'links'],
                properties: {
                  key: {
                    type: 'string',
                    minLength: 6,
                    maxLength: 6,
                  },
                  links: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'uri',
                    },
                  },
                },
              },
            },
          },
        },
      },
      preHandler: [authApiPermissionHandler('testimonials.write')],
      async handler() {
        const key = await testimonialsService.generateKey();
        const links = CORS_ORIGIN.map((origin) => {
          if (origin === '*') origin = 'http://localhost:3000';
          if (origin.endsWith('/')) {
            origin = origin.substring(0, origin.length - 1);
          }
          return `${origin}/testimonials/create/${key}`;
        });
        return {
          data: { key, links },
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
        description: 'get testimonials',
        security: [{ bearerAuth: [] }],
        tags: ['testimonials'],
        querystring: testimonialListPayloadSchema,
        response: {
          200: {
            description: 'testimonials',
            type: 'object',
            required: ['data'],
            properties: {
              data: {
                type: 'array',
                items: testimonialSchema,
              },
            },
          },
        },
      },
      preHandler: [authApiPermissionHandler('testimonials.read')],
      async handler(
        request: FastifyRequest<{
          Querystring: FromSchema<typeof testimonialListPayloadSchema>;
        }>,
      ) {
        const testimonials = await testimonialsService.getTestimonialsByPayload(
          request.query,
        );
        return {
          data: testimonials,
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
        description: 'delete testimonial',
        security: [{ bearerAuth: [] }],
        tags: ['testimonials'],
        params: testimonialDeleteSchema,
        response: {
          200: {
            description: 'testimonial',
            type: 'object',
            required: ['data'],
            properties: {
              data: testimonialSchema,
            },
          },
        },
      },
      preHandler: [authApiPermissionHandler('testimonials.delete')],
      async handler(
        request: FastifyRequest<{
          Params: FromSchema<typeof testimonialDeleteSchema>;
        }>,
      ) {
        const testimonial = await testimonialsService.deleteTestimonialById(
          request.params.id,
        );
        return {
          data: testimonial,
        };
      },
    });
});
