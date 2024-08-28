import * as env from 'env-var';

export const PORT = env.get('PORT').default(3001).asPortNumber();

export const IMAGEKIT_PUBLIC_KEY = env
  .get('IMAGEKIT_PUBLIC_KEY')
  .required()
  .asString();

export const IMAGEKIT_PRIVATE_KEY = env
  .get('IMAGEKIT_PRIVATE_KEY')
  .required()
  .asString();

export const IMAGEKIT_URL_ENDPOINT = env
  .get('IMAGEKIT_URL_ENDPOINT')
  .required()
  .asString();

export const REDIS_URL = env.get('REDIS_URL').required().asString();

export const PRODUCTION_URL =
  env.get('PRODUCTION_URL').asUrlString() ??
  env.get('VERCEL_PROJECT_PRODUCTION_URL').asString();

export const AUTH_KEY = env.get('AUTH_KEY').required().asString();

export const SMTP_URL = env.get('SMTP_URL').required().asUrlString();
