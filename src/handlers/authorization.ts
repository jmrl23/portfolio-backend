import { FastifyRequest } from 'fastify';
import { AUTH_KEY } from '../lib/constant/env';
import { Unauthorized } from 'http-errors';

export default async function authorizationHandler(request: FastifyRequest) {
  if (request.headers.authorization !== `Bearer ${AUTH_KEY}`) {
    throw new Unauthorized();
  }
}
