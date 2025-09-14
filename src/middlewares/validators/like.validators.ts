/**
 * Node Modules
 */
import { body, param } from 'express-validator';

const likeValidators = {
  validateBody: [
    param('blogId').isMongoId().withMessage('Invalid blog ID'),
    body('userId')
      .notEmpty()
      .withMessage('User id is required')
      .isMongoId()
      .withMessage('Invalid user ID'),
  ],
};

export default likeValidators;
