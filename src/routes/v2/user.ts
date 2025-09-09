/**
 * Node Modules
 */
import { Router } from 'express';
import { body, param, query } from 'express-validator';

/**
 * Controllers
 */
import { UserController } from '@/controllers/v2/user.controller';

/**
 * Middlewares
 */
import validationError from '@/middlewares/validationError';
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';

const router = Router();
const userController = new UserController();

/**
 * Current User
 */
router.get(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  userController.getCurrentUser,
);

router.put(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  body('username')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Username max length is 20'),
  body('email').optional().isEmail().withMessage('Must be valid email'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 chars'),
  body(['website', 'facebook', 'instagram', 'linkdin', 'x', 'youtube'])
    .optional()
    .isURL()
    .withMessage('Invalid URL'),
  validationError,
  userController.updateCurrentUser,
);

router.delete(
  '/current',
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
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit 1–50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be >= 0'),
  validationError,
  userController.getAllUsers,
);

router.get(
  '/:userId',
  authenticate,
  authorize(['admin']),
  param('userId').isMongoId().withMessage('Invalid user ID'),
  validationError,
  userController.getUserById,
);

router.delete(
  '/:userId',
  authenticate,
  authorize(['admin']),
  param('userId').isMongoId().withMessage('Invalid user ID'),
  validationError,
  userController.deleteUserById,
);

export default router;
