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

  logger.error('Unexpected Error', { message: err.message, stack: err.stack });
  return sendError(res, 'Internal server error', 500, 'ServerError');
};

export default errorHandler;
