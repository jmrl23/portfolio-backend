import { FastifyRequest } from 'fastify';
import { Unauthorized } from 'http-errors';
import { permissions } from './authService';
import { AUTH_BYPASS_ON_DEVELOPMENT, AUTH_KEY } from '../../lib/constant/env';

type Permission = (typeof permissions)[number];

export function authApiPermissionHandler(...permissions: Permission[]) {
  return async function (request: FastifyRequest) {
    if (AUTH_BYPASS_ON_DEVELOPMENT) return;
    const [scheme, key] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer') throw new Unauthorized();
    await request.server.authService.verifyAuthApiKey(key, permissions);
  };
}

export async function authApiRequiredMasterHandler(request: FastifyRequest) {
  if (AUTH_BYPASS_ON_DEVELOPMENT) return;
  const [scheme, key] = request.headers.authorization?.split(' ') ?? [];
  if (scheme !== 'Bearer') throw new Unauthorized();
  if (key !== AUTH_KEY) throw new Unauthorized('Invalid auth key');
}
