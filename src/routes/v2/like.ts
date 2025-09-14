/**
 * Node_Modules
 */
import { Router } from 'express';

/**
 * Middlewares
 */
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import likeValidators from '@/middlewares/validators/like.validators';

/**
 * Controllers
 */
import LikeController from '@/controllers/v2/like.controller';

const router = Router();
const likeController = new LikeController();

router.post(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  likeValidators.validateBody,
  likeController.likeBlog,
);

router.delete(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  likeValidators.validateBody,
  likeController.unLikeBlog,
);

export default router;
