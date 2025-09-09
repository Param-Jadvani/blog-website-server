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

/**
 * Define custom colors for log levels
 */
const levelColors: Record<string, string> = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'cyan',
  verbose: 'blue',
  debug: 'magenta',
  silly: 'gray',
};

winston.addColors(levelColors);

/**
 * ANSI escape codes for timestamp coloring in console logs
 */
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

/**
 * Console log format for non-production environments
 */
const consoleFormat = combine(
  colorize({ all: true }), // Colorize entire message (including metadata)
  timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
  align(),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const logMessage = stack || message;
    const metaString = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : '';
    return `${BLUE}${timestamp}${RESET} [${level}]: ${logMessage}${metaString}`;
  }),
);

/**
 * Configure transports based on environment
 */
const transports: winston.transport[] = [];

if (config.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    }),
  );
} else {
  // Production logs: JSON format without colors, include stack traces
  transports.push(
    new winston.transports.Console({
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),
  );
}

/**
 * Create the Winston logger instance
 */
const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports,
  silent: config.NODE_ENV === 'test', // Silence logs during testing
});

export { logger };
