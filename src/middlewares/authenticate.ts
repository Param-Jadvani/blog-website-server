/**
 * Node Modules
 */
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * Custom Moduels
 */
import { verifyAccessToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';

/**
 * Types
 */
import type { Request, Response, NextFunction } from 'express';
import type { Types } from 'mongoose';
import { AuthError } from '@/lib/errors';

/**
 * @function authenticate
 * @description Middleware to verify user's access token from the Authorization header.
 *              If the token is valid, the user's ID is attached to the request object.
 *              otherwise, it returns an appropriate error response.
 *
 * @param {Request} req - Express request object. Expects a Bearer token in the Authorization header.
 * @param {Response} res - Express response object used to send error response if authenticate fails.
 * @param {NextFunction} next - Express next function to pass control to the next middleware.
 *
 * @returns {Promise<void>}
 */
const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  // If there's no Bearer token, respond with 401 Unauthorized.
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      code: 'AuthenticationError',
      message: 'Access denied, no token provided',
    });
    return;
  }

  // Split out the token from the 'Bearer' prefix
  const [_, token] = authHeader.split(' ');

  try {
    // Verify the token and extract the userId from the payload
    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId };

    // Attach the userId to the request object for later use
    req.userId = jwtPayload.userId;

    // Proceed to the next middleware or route hanlder
    return next();
  } catch (error) {
    // Handle expired token error
    if (error instanceof TokenExpiredError) 
      throw new AuthError('Access token expired, request a new one with refresh token');
    

    // Handle invalid token error
    if (error instanceof JsonWebTokenError) 
      throw new AuthError('Access token invalid');
    

    // Catch-all for other errors
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error during authentication', error);
  }
};

export default authenticate;
