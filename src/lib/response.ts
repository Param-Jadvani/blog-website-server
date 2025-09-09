/**
 * Types
 */
import type { Response } from 'express';

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Send a success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
) {
  const response: ApiResponse<T> = {
    message,
    data,
  };
  return res.status(statusCode).json(response);
}

/**
 * Send an error response
 */
export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  code = 'ServerError',
) {
  const response: ApiResponse<null> = {
    error: { code, message },
  };
  return res.status(statusCode).json(response);
}
