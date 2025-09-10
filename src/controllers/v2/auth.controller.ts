/**
 * Custom Modules
 */
import { logger } from '@/lib/winston';
import { generateUsername } from '@/utils';
import config from '@/config';
import { asyncHandler } from '@/lib/async_handler';
import { sendSuccess } from '@/lib/response';
import { AuthorizationError } from '@/lib/errors';

/**
 * Service
 */
import AuthService from '@/services/v2/auth.service';

/**
 * Types
 */
import type { Request, Response } from 'express';

class AuthController {
  private authService = new AuthService();

  register = asyncHandler(async (req: Request, res: Response) => {
    if (
      req.body.role === 'admin' &&
      !config.WHITELIST_ADMINS_MAIL.includes(req.body.email)
    ) {
      logger.warn(
        `User with email ${req.body.email} tried to register as an admin but is not in the whitelist`,
      );
      throw new AuthorizationError('You cannot register as admin');
    }

    req.body.username = generateUsername();
    const result = await this.authService.register(req.body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      signed: true,
    });

    logger.info('User registered successfully', { email: result.user.email });
    sendSuccess(res, 201, result, 'User registered successfully');
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      signed: true,
    });

    logger.info('User login successful', { email: result.user.email });
    sendSuccess(res, 200, result, 'Login successful');
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const token = req.signedCookies.refreshToken;
    const accessToken = await this.authService.refreshToken(token);

    sendSuccess(res, 200, { accessToken }, 'Access token refreshed');
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    await this.authService.logout(req.signedCookies.refreshToken, req.userId!);

    res.clearCookie('refreshToken', {
      signed: true,
      httpOnly: true,
      sameSite: 'strict',
    });

    logger.info('User logged out', { userId: req.userId });
    sendSuccess(res, 200, null, 'Logout successful');
  });
}

export default AuthController;
