import { JSONSchema } from 'json-schema-to-ts';
import { FastifyInstance } from 'fastify';

export type Schema = JSONSchema & Record<string, unknown>;

export function asJsonSchema<const T extends Schema>(schema: T): T {
  return schema;
}

interface RouteFunction {
  (router: FastifyInstance): Promise<void>;
}

export function asRoute(fn: RouteFunction): RouteFunction {
  return fn;
}
