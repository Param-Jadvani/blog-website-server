/**
 * Node Modules
 */
import { Router } from 'express';
import { body, cookie } from 'express-validator';

/**
 * Controllers
 */
import { AuthController } from '@/controllers/v2/auth.controller';

/**
 * Middlewares
 */
import validationError from '@/middlewares/validationError';
import authenticate from '@/middlewares/authenticate';


const router = Router();
const authController = new AuthController();

/**
 * Register
 */
router.post(
  '/register',
  body('email').isEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  validationError,
  authController.register,
);

/**
 * Login
 */
router.post(
  '/login',
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  validationError,
  authController.login,
);

/**
 * Refresh Token
 */
router.post(
  '/refresh-token',
  cookie('refreshToken').notEmpty().withMessage('Refresh token required'),
  validationError,
  authController.refreshToken,
);

/**
 * Logout
 */
router.get('/logout', authenticate, authController.logout);

export default router;
