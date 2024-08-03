import * as c from 'colorette';
import dotenv from 'dotenv';
import { globSync } from 'glob';
import path from 'node:path';
import { logger } from './lib/common';

console.clear();

// possible values for `process.env.NODE_ENV`
const NODE_ENV_VALUES = ['development', 'production', 'test'] as const;
declare global {
  type NodeEnv = (typeof NODE_ENV_VALUES)[number];
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: NodeEnv;
    }
  }
}
if (process.env.NODE_ENV === undefined) process.env.NODE_ENV = 'development';
if (!NODE_ENV_VALUES.includes(process.env.NODE_ENV))
  throw new Error('Invalid `process.env.NODE_ENV` value');
// --

const NODE_ENV = process.env.NODE_ENV;
const PROJECT_DIR = path.resolve(__dirname, '../');
const ENV_PATHS = globSync(
  [
    path.resolve(PROJECT_DIR, '.env'),
    path.resolve(PROJECT_DIR, `.env.${NODE_ENV}`),
    path.resolve(PROJECT_DIR, '.env.local'),
    path.resolve(PROJECT_DIR, `.env.${NODE_ENV}.local`),
  ],
  { absolute: true },
);

// load from `.env` files
for (const envPath of ENV_PATHS) {
  const { parsed } = dotenv.config({
    path: envPath,
    override: true,
  });
  const keys = Object.keys(parsed ?? {});
  if (keys.length < 1) continue;
  if (keys.includes('NODE_ENV')) {
    process.env.NODE_ENV = NODE_ENV;
    logger.warn(`Tried to alter \`NODE_ENV\` using a .env file: ${envPath}`);
  }
  logger.info(`${c.bold('registered env')} ${envPath}`);
}
