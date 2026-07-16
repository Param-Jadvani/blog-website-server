/**
 * Node Modules
 */
import { body } from 'express-validator';

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
  register: [...validateAuthBody, body('email').toLowerCase()],

  login: [...validateAuthBody],

  refreshToken: [],
};

export default authValidators;
