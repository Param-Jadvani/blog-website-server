/**
 * Node Modules
 */
import winston from 'winston';

/**
 * Custom Modules
 */
import config from '@/config';

const { combine, timestamp, json, errors, align, printf, colorize } =
  winston.format;

// Define the transport array to hold different logging transports
const transports: winston.transport[] = [];

if (config.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }), // add colors to log levels
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }), // ddd timestamp to logs
        align(), //align log messages
        printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? `\n${JSON.stringify(meta)}`
            : '';

          return `${timestamp} [${level}]: ${message}${metaStr}`;
        }),
      ),
    }),
  );
}

// Create a logger instance for using winston
const logger = winston.createLogger({
  level: config.LOG_LEVEL, // Set the default logging level to 'info'
  format: combine(timestamp(), errors({ stack: true }), json()), // Use JSON formate for log the messages
  transports,
  silent: config.NODE_ENV === 'test', // Disable logging in test enviroment
});

export { logger };
