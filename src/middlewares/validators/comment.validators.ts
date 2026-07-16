/**
 * Node Modules
 */
import { body, param, query } from 'express-validator';

const validateBody = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 1000 })
    .withMessage('Content must be less than 1000 characters'),
];

const commentValidators = {
  createComment: [...validateBody],
  updateComment: [...validateBody],
  getByBlog: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 to 50'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Page must be positive integer'),
  ],
  paramId: (paramId: string, message: string) => [
    param(paramId).notEmpty().isMongoId().withMessage(message),
  ],
};

export default commentValidators;
