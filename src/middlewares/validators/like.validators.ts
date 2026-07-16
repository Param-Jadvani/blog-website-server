/**
 * Node Modules
 */
import { param } from 'express-validator';

const likeValidators = {
  validateBody: [param('blogId').isMongoId().withMessage('Invalid blog ID')],
};

export default likeValidators;
