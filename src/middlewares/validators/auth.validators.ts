/**
 * Node Modules
 */
import { body, cookie } from 'express-validator';

const validateAuthBody = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isLength({ max: 50 })
    .withMessage('Email must be less than 50 character')
    .isEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 character long.'),
];

const authValidators = {
  register: [
    ...validateAuthBody,
    body('role')
      .optional()
      .isString()
      .withMessage('Role is required')
      .isIn(['admin', 'user'])
      .withMessage('Role must be either admin or user.'),
  ],

  login: [...validateAuthBody],

  refreshToken: [
    cookie('refreshToken')
      .notEmpty()
      .withMessage('Refresh token required')
      .isJWT()
      .withMessage('Invalid refresh token'),
  ],
};

export default authValidators;
