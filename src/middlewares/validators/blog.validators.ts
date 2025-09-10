/**
 * Node Modules
 */
import { body, param, query } from 'express-validator';

const blogValidators = {
  getAllBlogs: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 to 50'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Page must be positive integer'),
  ],
  createBlog: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 180 })
      .withMessage('Title must be less than 180 charcters'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('status')
      .optional()
      .isIn(['draft', 'published'])
      .withMessage('Status must be one of the value, draft or published'),
  ],
  updateBlog: [
    body('title')
      .optional()
      .isLength({ max: 180 })
      .withMessage('Title must be less than 180 charcters'),
    body('content').trim(),
    body('status')
      .optional()
      .isIn(['draft', 'published'])
      .withMessage('Status must be one of the value, draft or published'),
  ],
  paramId: (paramId: string, message: string) => [
    param(paramId).notEmpty().isMongoId().withMessage(message),
  ],
};

export default blogValidators;
