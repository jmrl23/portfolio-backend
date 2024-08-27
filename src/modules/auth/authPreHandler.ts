import { FastifyRequest } from 'fastify';
import { Unauthorized } from 'http-errors';
import { AUTH_KEY } from '../../lib/constant/env';

export async function authPreHandler(request: FastifyRequest) {
  if (request.headers.authorization !== `Bearer ${AUTH_KEY}`) {
    throw new Unauthorized();
  }
}
