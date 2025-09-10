/**
 * @copyright 2025 Param-Jadvani
 * @license Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Node Modules
 */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

/**
 * Custom Modules
 */
import config from '@/config';
import limiter from '@/lib/express_rate_limit';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';
import { logger } from '@/lib/winston';

/**
<<<<<<< HEAD
=======
 * Middleware
 */
import errorHandler from '@/middlewares/global_error_handler';

/**
>>>>>>> c2b5287 (blog CRUD logic add & validation update)
 * Routes
 */
import v2Routes from '@/routes/v2';

/**
 * Types
 */
import type { CorsOptions } from 'cors';

/**
 * Express App Initial
 */
const app = express();

// Configure CORS Options
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      !config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      // Reject requests fron non-whitelisted origins
      callback(
        new Error(`CORS error: ${origin} is not allowed by CORS.`),
        false,
      );
      logger.warn(`CORS error: ${origin} is not allowed by CORS.`);
    }
  },
};

// Apply CORS Middleware
app.use(cors(corsOptions));

// Apply JSON request body parsing
app.use(express.json({ limit: '10kb' }));

// Enable URL-Encoded request body parsing with extended mode
// `extended: true` allows rich objects and arrays via querystring library.
app.use(
  express.urlencoded({ limit: '10kb', extended: true, parameterLimit: 50000 }),
);

app.use(cookieParser(config.COOKIE_SECRET));

// Enable response compression to reduce payload size and improve performance.
app.use(
  compression({
    threshold: 1024, // Only compress response larger than 1KB.
  }),
);

// Use Helmet to enhance security by setting various HTTP headers.
app.use(helmet());

// Apply rate limitting middleware to prevent excessive requests and anhance security.
app.use(limiter);

(async () => {
  try {
    await connectToDatabase();

    app.use(`${config.API_BASE_PATH}/v2`, v2Routes);

    /**
     * Global Error Handler
     * Must come AFTER all routes and middlewares
     */
    app.use(errorHandler);

    app.listen(config.PORT, () => {
      logger.info(
        `Server running: http://localhost:${config.PORT}${config.API_BASE_PATH}`,
      );
    });
  } catch (err) {
    logger.error('Failed to start the server', err);

    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

/**
 * Handles server shutdown gracefully by disconnecting from the database.
 *
 * - Attampts to disconnect from the database before shutting down the server.
 * - Logs a sucess message if the diconnection is successfull.
 * - If an error occurs during disconnection, it is logged to the console.
 * - Exists the process with status code '0' (indicating a successfull shutdown.)
 */
const handleSeverShutDown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn('Server SHUTDOWN');
    process.exit(0);
  } catch (error) {
    logger.error('Error during server shutdown', error);
  }
};

/**
 * Listens for termination signals (`SIGTERM` and `SIGINT`).
 *
 * - `SIGTERM` is typically sent when  stopping a process (e.g., 'kill' command or container shutdown).
 * - `SIGINT` is triggerd when the user interrupts the process (e.g., pressing the `CTRL + C`).
 * - When either signal is received, `handleSeverShutDown` is executed to ensure proper cleanup.
 */
process.on('SIGTERM', handleSeverShutDown);
process.on('SIGINT', handleSeverShutDown);
