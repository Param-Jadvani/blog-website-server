/**
 * Types
 */
import type { Request, Response, NextFunction } from 'express';

/**
 * Custom Modules
 */
import { AppError } from '@/lib/errors';
import { sendError } from '@/lib/response';
import { logger } from '@/lib/winston';
import { MongoServerError } from 'mongodb';
import { MulterError } from 'multer';

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    logger.error(`[${err.code}] ${err.message}`);
    return sendError(res, err.message, err.statusCode, err.code);
  }

  if (err instanceof MongoServerError && err.code === 11000) {
    return sendError(
      res,
      'A resource with this value already exists',
      409,
      'Conflict',
    );
  }

  if (err instanceof MulterError) {
    return sendError(
      res,
      err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message,
      400,
      'ValidationError',
    );
  }

  if (err.message === 'Route not found') {
    return sendError(res, err.message, 404, 'NotFound');
  }

  logger.error('Unexpected Error', { message: err.message, stack: err.stack });
  return sendError(res, 'Internal server error', 500, 'ServerError');
};

export default errorHandler;
