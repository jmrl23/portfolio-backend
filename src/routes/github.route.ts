import redisStore from '@jmrl23/redis-store';
import { caching } from 'cache-manager';
import ms from 'ms';
import { asRoute } from '../lib/common';
import { REDIS_URL } from '../lib/constant/env';
import CacheService from '../services/CacheService';
import GitHubService from '../services/GitHubService';
import { projectSchema } from '../schemas/github';

export const prefix = '/github';

export default asRoute(async function githubRoute(app) {
  const cacheStore = redisStore({
    url: REDIS_URL,
    prefix: 'PortfolioBackend:GitHubService',
    ttl: ms('5m'),
  });
  const cacheService = new CacheService(await caching(cacheStore));
  const githubService = new GitHubService(cacheService);

  app.route({
    method: 'GET',
    url: '/projects',
    schema: {
      description: 'Get pinned repositories',
      tags: ['github'],
      response: {
        200: {
          type: 'object',
          additionalProperties: false,
          required: ['projects'],
          properties: {
            projects: {
              type: 'array',
              items: projectSchema,
            },
          },
        },
      },
    },
    async handler() {
      const projects = await githubService.getProjects();
      return {
        projects,
      };
    },
  });
});
