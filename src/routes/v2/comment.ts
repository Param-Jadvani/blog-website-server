/**
 * Node_Modules
 */
import { Router } from 'express';

/**
 * Middlewares
 */
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validationError from '@/middlewares/validationError';
import commentValidators from '@/middlewares/validators/comment.validators';

/**
 * Controllers
 */
import CommentController from '@/controllers/v2/comment.controller';

/**
 * Models
 */

const router = Router();
const commentController = new CommentController();

router
  .route('/blog/:blogId')
  .get(
    authenticate,
    authorize(['admin', 'user']),
    commentValidators.paramId('blogId', 'Invalid blog ID'),
    commentController.getCommentsByBlog,
  )
  .post(
    authenticate,
    authorize(['admin', 'user']),
    commentValidators.paramId('blogId', 'Invalid blog ID'),
    commentValidators.createComment,
    validationError,
    commentController.createComment,
  );

router
  .route('/:commentId')
  .put(
    authenticate,
    commentValidators.paramId('commentId', 'Invalid comment ID'),
    commentValidators.updateComment,
    validationError,
    commentController.updateComment,
  )
  .delete(
    authenticate,
    authorize(['admin', 'user']),
    commentValidators.paramId('commentId', 'Invalid comment ID'),
    commentController.deleteComment,
  );

export default router;
