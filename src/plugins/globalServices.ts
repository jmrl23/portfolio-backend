import redisStore from '@jmrl23/redis-store';
import { caching } from 'cache-manager';
import fastifyPlugin from 'fastify-plugin';
import ms from 'ms';
import { REDIS_URL } from '../lib/constant/env';
import { CacheService } from '../modules/cache/cacheService';
import { FilesService } from '../modules/files/filesService';
import { filesStoreFactory } from '../modules/files/filesStoreFactory';
import { AuthService } from '../modules/auth/authService';

declare module 'fastify' {
  interface FastifyInstance {
    cacheService: CacheService;
    filesService: FilesService;
    authService: AuthService;
  }
}

export default fastifyPlugin(async function (app) {
  const cacheService = new CacheService(
    await caching(
      redisStore({
        url: REDIS_URL,
        prefix: 'Portfolio:[Global]:CacheService',
        ttl: ms('30m'),
      }),
    ),
  );

  const filesService = new FilesService(
    cacheService,
    await filesStoreFactory('imagekit'),
    app.prismaClient,
  );

  const authService = new AuthService(cacheService, app.prismaClient);

  app.decorate('cacheService', cacheService);
  app.decorate('filesService', filesService);
  app.decorate('authService', authService);
});
