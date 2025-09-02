
/**
 * Node Modules
 */
import mongoose from 'mongoose';

/**
 * Custom Modules
 */
import config from '@/config';
import { logger } from '@/lib/winston';

/**
 * Types
 */
import type { ConnectOptions } from 'mongoose';

/**
 * Client Options
 */
const clientOptions: ConnectOptions = {
  dbName: 'blog-api',
  appName: 'Blog-API',
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * If an error occurs during the connection process, it throw an error with a descriptive message.
 *
 * - Uses `MONGO_URI` as a connection string.
 * - `clientOptions` contains additional configuration for Mongoose.
 *  - Errors are properly handled and rethrown for better debugging.
 */
export const connectToDatabase = async (): Promise<void> => {
  if (!config.MONGO_URI) {
    throw new Error('MongoDB URI is not defined in the configuration.');
  }

  try {
    await mongoose.connect(config.MONGO_URI, clientOptions);

    logger.info('Connected to the database secessfully.', {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    logger.error('Error connecting to the database', error);
  }
};

/**
 * Disconnects from the MongoDB database using Mongoose.
 *
 * This functions attempts to disconnect from the databse asynchronously.
 * If the disconnection is sucessful, a sucess message is logged.
 * If an error occurs, it is either re-thrown as a new Error (if it's an instance of Error) or looged to the console.
 */
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();

    logger.info('Disconnected from the database secessfully.', {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    logger.error('Error disconnecting from the database', error);
  }
};
