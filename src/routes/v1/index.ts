/**
 * Node Modules
 */
import { Router } from 'express';
const router = Router();

/**
 * Routes
 */
import authRoutes from '@/routes/v1/auth';
<<<<<<< HEAD
=======
import userRoutes from '@/routes/v1/user';
>>>>>>> a524f58 (Login-Logout & User CRUD logic add successfully)

/**
 * Root Router
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is Live.',
    status: 'ok',
    version: '1.0.0',
    docs: 'URL',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
<<<<<<< HEAD
=======
router.use('/users', userRoutes);
>>>>>>> a524f58 (Login-Logout & User CRUD logic add successfully)

export default router;
