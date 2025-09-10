/**
 * Node Modules
 */
import { Router } from 'express';

/**
 * Controllers
 */
import UserController from '@/controllers/v2/user.controller';

/**
 * Middlewares
 */
import validationError from '@/middlewares/validationError';
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import userValidators from '@/middlewares/validators/user.validators';

const router = Router();
const userController = new UserController();

/**
 * Current User
 */
router
  .route('/current')
  .get(
    authenticate,
    authorize(['admin', 'user']),
    userController.getCurrentUser,
  )
  .put(
    authenticate,
    authorize(['admin', 'user']),
    userValidators.updateCurrent,
    validationError,
    userController.updateCurrentUser,
  )
  .delete(
    authenticate,
    authorize(['admin', 'user']),
    userController.deleteCurrentUser,
  );

/**
 * Admin Routes
 */
router.get(
  '/',
  authenticate,
  authorize(['admin']),
  userValidators.getAll,
  validationError,
  userController.getAllUsers,
);

router
  .route('/:userId')
  .get(
    authenticate,
    authorize(['admin']),
    userValidators.userId,
    validationError,
    userController.getUserById,
  )
  .delete(
    authenticate,
    authorize(['admin']),
    userValidators.userId,
    validationError,
    userController.deleteUserById,
  );

export default router;
