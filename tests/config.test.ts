const requiredEnv = {
  MONGO_URI: 'mongodb://example.test/blog',
  COOKIE_SECRET: 'cookie-secret',
  JWT_ACCESS_SECRET: 'access-secret',
  JWT_REFRESH_SECRET: 'refresh-secret',
  CLOUDINARY_CLOUD_NAME: 'cloud',
  CLOUDINARY_API_KEY: 'key',
  CLOUDINARY_API_SECRET: 'secret',
};

import { parseConfig } from '@/config';

const buildEnv = (overrides: Record<string, string | undefined> = {}) => ({
  ...requiredEnv,
  ...overrides,
});

describe('configuration', () => {
  it('uses safe defaults and normalizes origin lists', () => {
    const config = parseConfig(
      buildEnv({
        WHITELIST_ORIGINS: ' https://one.test, ,https://two.test ',
      }),
    );

    expect(config).toMatchObject({
      API_BASE_PATH: '/api',
      PORT: 3000,
      NODE_ENV: 'development',
      LOG_LEVEL: 'info',
      REFRESH_COOKIE_MAX_AGE_MS: 604800000,
      WHITELIST_ORIGINS: ['https://one.test', 'https://two.test'],
    });
  });

  it('uses supplied runtime values', () => {
    const config = parseConfig(
      buildEnv({
        PORT: '8080',
        NODE_ENV: 'production',
        API_BASE_PATH: '/custom',
        LOG_LEVEL: 'debug',
        REFRESH_COOKIE_MAX_AGE_MS: '1000',
      }),
    );
    expect(config).toMatchObject({
      PORT: 8080,
      NODE_ENV: 'production',
      API_BASE_PATH: '/custom',
      LOG_LEVEL: 'debug',
      REFRESH_COOKIE_MAX_AGE_MS: 1000,
    });
  });

  it.each([
    [
      { MONGO_URI: undefined },
      'Missing required environment variable: MONGO_URI',
    ],
    [{ PORT: '0' }, 'PORT must be a valid TCP port'],
    [{ PORT: 'not-a-number' }, 'PORT must be a valid TCP port'],
    [
      { REFRESH_COOKIE_MAX_AGE_MS: '0' },
      'REFRESH_COOKIE_MAX_AGE_MS must be a positive integer',
    ],
  ])('rejects invalid environment %o', (overrides, message) => {
    expect(() => parseConfig(buildEnv(overrides))).toThrow(message);
  });
});
