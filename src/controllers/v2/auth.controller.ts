/**
 * Custom Modules
 */
import { logger } from '@/lib/winston';
import { generateUsername } from '@/utils';
import config from '@/config';
import { asyncHandler } from '@/lib/async_handler';
import { sendSuccess } from '@/lib/response';
import { AuthError } from '@/lib/errors';
import { matchedData } from 'express-validator';

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

  private readonly refreshCookie = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    signed: true,
    maxAge: config.REFRESH_COOKIE_MAX_AGE_MS,
    path: `${config.API_BASE_PATH}/v2/auth`,
  };

  register = asyncHandler(async (req: Request, res: Response) => {
    const data = matchedData(req, { locations: ['body'] }) as {
      email: string;
      password: string;
    };
    const result = await this.authService.register({
      ...data,
      username: generateUsername(),
    });

    res.cookie('refreshToken', result.refreshToken, this.refreshCookie);

    logger.info('User registered successfully', { email: result.user.email });
    sendSuccess(
      res,
      201,
      { user: result.user, accessToken: result.accessToken },
      'User registered successfully',
    );
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.login(
      matchedData(req, { locations: ['body'] }),
    );

    res.cookie('refreshToken', result.refreshToken, this.refreshCookie);

    logger.info('User login successful', { email: result.user.email });
    sendSuccess(
      res,
      200,
      { user: result.user, accessToken: result.accessToken },
      'Login successful',
    );
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const token = req.signedCookies.refreshToken;
    if (!token || typeof token !== 'string')
      throw new AuthError('No refresh token');
    const accessToken = await this.authService.refreshToken(token);

    sendSuccess(res, 200, { accessToken }, 'Access token refreshed');
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.signedCookies.refreshToken;
    if (typeof token === 'string') await this.authService.logout(token);

    res.clearCookie('refreshToken', this.refreshCookie);

    logger.info('User logged out');
    sendSuccess(res, 200, null, 'Logout successful');
  });
}

export default AuthController;
