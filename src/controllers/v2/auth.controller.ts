/**
 * Node Modules
 */
import { Request, Response } from 'express';

/**
 * Custom Modules
 */
import { logger } from '@/lib/winston';
import { generateUsername } from '@/utils';
import config from '@/config';

/**
 * Service
 */
import { AuthService } from '@/services/v2/auth.service';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      if (
        req.body.role === 'admin' &&
        !config.WHITELIST_ADMINS_MAIL.includes(req.body.email)
      ) {
        res.status(403).json({
          code: 'AuthorizationError',
          message: 'You cannot register as admin',
        });

        logger.warn(
          `User with email ${req.body.email} tried to register as an admin but is not in the whitelist`,
        );
        return;
      }
      req.body.username = generateUsername();
      const result = await this.authService.register(req.body);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        signed: true,
      });
      res.status(201).json(result);
    } catch (error: any) {
      logger.error('AuthController.register error', error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const result = await this.authService.login(req.body);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        signed: true,
      });
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('AuthController.login error', error);
      res.status(error.statusCode || 401).json({ message: error.message });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const token = req.cookies.refreshToken;
      const accessToken = await this.authService.refreshToken(token);
      res.status(200).json({ accessToken });
    } catch (error: any) {
      logger.error('AuthController.refreshToken error', error);
      res.status(error.statusCode || 401).json({ message: error.message });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      await this.authService.logout(
        req.signedCookies.refreshToken,
        req.userId!,
      );

      res.clearCookie('refreshToken', {
        signed: true,
        httpOnly: true,
        sameSite: 'strict',
      });
      res.sendStatus(204);
    } catch (error: any) {
      logger.error('AuthController.logout error', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}
