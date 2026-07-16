/**
 * Custom Modules
 */
/**
 * Models
 */
import User from '@/models/user';

/**
 * Types
 */
import { Request, Response, NextFunction } from 'express';
import { AuthorizationError, NotFoundError } from '@/lib/errors';

export type AuthRoles = 'admin' | 'user';

const authorize =
  (roles: AuthRoles[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    try {
      const user = await User.findById(userId).select('role').exec();

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (!roles.includes(user.role)) {
        throw new AuthorizationError('Access denied, insufficient permissions');
      }

      return next();
    } catch (error) {
      next(error);
    }
  };

export default authorize;
