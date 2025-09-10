/**
 * Types
 */
import type { Request, Response, NextFunction } from 'express';

/**
 * Wrap async route handlers so we don't repeat try/catch
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
