import env from 'env-var';

export const SERVER_HOST = env.get('SERVER_HOST').default('0.0.0.0').asString();

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

export const DISCORD_WEBHOOK_URL = env
  .get('DISCORD_WEBHOOK_URL')
  .required()
  .asString();

export const PRODUCTION_URL = env.get('PRODUCTION_URL').asUrlString();

export const GITHUB_PERSONAL_ACCESS_TOKEN = env
  .get('GITHUB_PERSONAL_ACCESS_TOKEN')
  .required()
  .asString();

export const AUTH_KEY = env.get('AUTH_KEY').required().asString();
