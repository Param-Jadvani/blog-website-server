/**
 * Node Modules
 */
import { Router } from 'express';
<<<<<<< HEAD
import { body } from 'express-validator';
=======
import { body, cookie } from 'express-validator';
import argon2 from 'argon2';
>>>>>>> a524f58 (Login-Logout & User CRUD logic add successfully)

/**
 * Controllers
 */
import register from '@/controllers/v1/auth/register';
<<<<<<< HEAD
import validationError from '@/middlewares/validationError';
=======
import login from '@/controllers/v1/auth/login';
import refreshToken from '@/controllers/v1/auth/refresh_token';
import logout from '@/controllers/v1/auth/logout';
>>>>>>> a524f58 (Login-Logout & User CRUD logic add successfully)

/**
 * Middlewares
 */
<<<<<<< HEAD
=======
import validationError from '@/middlewares/validationError';
import authenticate from '@/middlewares/authenticate';
>>>>>>> a524f58 (Login-Logout & User CRUD logic add successfully)

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

<<<<<<< HEAD
=======
router.post(
  '/login',
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

      if (!userExists) {
        throw new Error('User email or password is invalid.');
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 character long.')
    .custom(async (value, { req }) => {
      const { email } = req.body as { email: string };
      const user = await User.findOne({ email })
        .select('password')
        .lean()
        .exec();

      if (!user) {
        throw new Error('User email or password is invalid');
      }

      const passwordMatch = await argon2.verify(user.password, value);

      console.log(passwordMatch);

      if (!passwordMatch) {
        throw new Error('User email or password is invalid');
      }
    }),
  validationError,
  login,
);

router.post(
  '/refresh-token',
  cookie('refreshToken')
    .notEmpty()
    .withMessage('Refresh token required')
    .isJWT()
    .withMessage('Invalid refresh token'),
  refreshToken,
);

router.get('/logout', authenticate, logout);

>>>>>>> a524f58 (Login-Logout & User CRUD logic add successfully)
export default router;
