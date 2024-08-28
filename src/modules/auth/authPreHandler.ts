import { FastifyRequest } from 'fastify';
import { Unauthorized } from 'http-errors';
import { permissions } from './authService';

type Permission = (typeof permissions)[number];

export function authApiPermissionHandler(...permissions: Permission[]) {
  return async function (request: FastifyRequest) {
    const [scheme, key] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer') throw new Unauthorized('Invalid scheme');
    await request.server.authService.verifyAuthApiKey(key, permissions);
  };
}
