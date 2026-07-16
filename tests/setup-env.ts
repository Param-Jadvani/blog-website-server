Object.assign(process.env, {
  NODE_ENV: 'test',
  MONGO_URI: 'mongodb://unit-test.invalid/blog-api',
  COOKIE_SECRET: 'unit-test-cookie-secret',
  JWT_ACCESS_SECRET: 'unit-test-access-secret',
  JWT_REFRESH_SECRET: 'unit-test-refresh-secret',
  CLOUDINARY_CLOUD_NAME: 'unit-test-cloud',
  CLOUDINARY_API_KEY: 'unit-test-key',
  CLOUDINARY_API_SECRET: 'unit-test-secret',
});
