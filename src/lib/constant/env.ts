import env from 'env-var';

export const NODE_ENV = process.env.NODE_ENV;

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
