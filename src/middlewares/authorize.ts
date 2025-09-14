/**
 * Custom Modules
 */
import { logger } from '@/lib/winston';

/**
 * Models
 */
import User from '@/models/user';

/**
 * Types
 */
import { Request, Response, NextFunction } from 'express';

export type AuthRoles = 'admin' | 'user';

const authorize =
  (roles: AuthRoles[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    try {
      const user = await User.findById(userId).select('role').exec();

      if (!user) {
        return res.status(404).json({
          code: 'NotFound',
          message: 'User not found',
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          code: 'AuthorizationError',
          message: 'Access denied, insufficient permissions',
        });
      }

      return next();
    } catch (error) {
      res.status(500).json({
        code: 'ServerError',
        message: 'Internal server error',
        error,
      });

      logger.error('Error while authorized user', error);
    }
  };

export default authorize;
