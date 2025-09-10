/**
 * Node Modules
 */
import { Router } from 'express';

/**
 * Controllers
 */
import  AuthController from '@/controllers/v2/auth.controller';

/**
 * Middlewares
 */
import validationError from '@/middlewares/validationError';
import authenticate from '@/middlewares/authenticate';
import authValidators from '@/middlewares/validators/auth.validators';

const router = Router();
const authController = new AuthController();

/**
 * Register
 */
router.post(
  '/register',
  authValidators.register,
  validationError,
  authController.register,
);

/**
 * Login
 */
router.post(
  '/login',
  authValidators.login,
  validationError,
  authController.login,
);

/**
 * Refresh Token
 */
router.post(
  '/refresh-token',
  authValidators.refreshToken,
  validationError,
  authController.refreshToken,
);

/**
 * Logout
 */
router.get('/logout', authenticate, authController.logout);

export default router;
