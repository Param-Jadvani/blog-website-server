/**
 * Node Modules
 */
import { Router } from 'express';
import { body } from 'express-validator';

/**
 * Controllers
 */
import register from '@/controllers/v1/auth/register';
import validationError from '@/middlewares/validationError';

/**
 * Middlewares
 */

/**
 * Models
 */
import User from '@/models/user';

const router = Router();

router.post(
  '/register',
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 character')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value: string) => {
      const userExists = await User.exists({ email: value });

      if (userExists) {
        throw new Error('User already exists.');
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 character long.'),
  body('role')
    .optional()
    .isString()
    .withMessage('Role is required')
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user.'),
  validationError,
  register,
);

export default router;
