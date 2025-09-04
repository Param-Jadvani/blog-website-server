/**
 * Node Modules
 */
import { validationResult } from 'express-validator';

/**
 * Types
 */
import type { Request, Response, NextFunction } from 'express';

const validationError = (req: Request, res: Response, next: NextFunction) => {
  const erorrs = validationResult(req);

  console.log(erorrs);

  if (!erorrs.isEmpty()) {
    return res.status(400).json({
      code: 'ValidationError',
      errors: erorrs.mapped(),
    });
  }

  next();
};

export default validationError;
