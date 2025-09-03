/**
 * Node Modules
 */
import dotenv from 'dotenv';

/**
 * Types
 */
import type ms from 'ms';

dotenv.config();

const config = {
  API_BASE_PATH: '/api/v1',
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  WHITELIST_ORIGINS: ['http://localhost:5173'],
  MONGO_URI: process.env.MONGO_URI,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY as ms.StringValue,
  WHITELIST_ADMINS_MAIL: ['johndoe@gmail.com', 'doejohn@gmail.com'],
<<<<<<< HEAD
=======
  DEFAULT_RESPONSE_LIMIT: 20,
  DEFAULT_RESPONSE_OFFSET: 0,
>>>>>>> a524f58 (Login-Logout & User CRUD logic add successfully)
};

export default config;
