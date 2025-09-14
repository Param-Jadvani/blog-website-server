/**
 * Node Modules
 */
import { Router } from 'express';
const router = Router();

/**
 * Routes
 */
import authRoutes from '@/routes/v2/auth';
import userRoutes from '@/routes/v2/user';
import blogRoutes from '@/routes/v2/blog';
import likeRoutes from '@/routes/v2/like';
import commentRoutes from '@/routes/v2/comment';

/**
 * Root Router
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is Live.',
    status: 'ok',
    version: '2.0.0',
    docs: 'URL',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/blogs', blogRoutes);
router.use('/likes', likeRoutes); 
router.use('/comments', commentRoutes);

export default router;
