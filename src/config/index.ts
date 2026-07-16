/**
 * Node Modules
 */
import dotenv from 'dotenv';

/**
 * Types
 */
import type ms from 'ms';

dotenv.config({ quiet: process.env.NODE_ENV === 'test' });

const required = [
  'MONGO_URI',
  'COOKIE_SECRET',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
] as const;

export const parseConfig = (env: NodeJS.ProcessEnv = process.env) => {
  for (const key of required) {
    if (!env[key])
      throw new Error(`Missing required environment variable: ${key}`);
  }

  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('PORT must be a valid TCP port');

  const refreshCookieMaxAge = Number(
    env.REFRESH_COOKIE_MAX_AGE_MS || 604800000,
  );
  if (!Number.isSafeInteger(refreshCookieMaxAge) || refreshCookieMaxAge <= 0)
    throw new Error('REFRESH_COOKIE_MAX_AGE_MS must be a positive integer');

  return {
    API_BASE_PATH: env.API_BASE_PATH || '/api',
    PORT: port,
    NODE_ENV: env.NODE_ENV || 'development',
    WHITELIST_ORIGINS: (env.WHITELIST_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    MONGO_URI: env.MONGO_URI!,
    LOG_LEVEL: env.LOG_LEVEL || 'info',
    COOKIE_SECRET: env.COOKIE_SECRET!,
    JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET!,
    ACCESS_TOKEN_EXPIRY: env.ACCESS_TOKEN_EXPIRY as ms.StringValue,
    REFRESH_TOKEN_EXPIRY: env.REFRESH_TOKEN_EXPIRY as ms.StringValue,
    DEFAULT_RESPONSE_LIMIT: 20,
    DEFAULT_RESPONSE_OFFSET: 0,
    REFRESH_COOKIE_MAX_AGE_MS: refreshCookieMaxAge,
    CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME!,
    CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY!,
    CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET!,
  };
};

export default parseConfig();
