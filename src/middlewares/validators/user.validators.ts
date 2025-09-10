/**
 * Node Modules
 */
import { body, param, query } from 'express-validator';

const userValidators = {
  updateCurrent: [
    body('username')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Username must be less than 20 character'),
    body('email')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Email must be less than 50 character')
      .isEmail()
      .withMessage('Invalid email address'),
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 character long.'),
    body('first_name')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('First name must be less than 20 character'),
    body('last_name')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Last name must be less than 20 character'),
    body(['website', 'facebook', 'instagram', 'linkdin', 'x', 'youtube'])
      .optional()
      .isURL()
      .withMessage('Invalid URL')
      .isLength({ max: 100 })
      .withMessage('Url must be less than 100 character'),
  ],

  getAll: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 to 50'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Page must be positive integer'),
  ],

  userId: [
    param('userId').notEmpty().isMongoId().withMessage('Invalid user ID'),
  ],
};

export default userValidators;
