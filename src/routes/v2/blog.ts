/**
 * Node_Modules
 */
import { Router } from 'express';
import multer from 'multer';

/**
 * Middlewares
 */
import authenticate from '@/middlewares/authenticate';
import validationError from '@/middlewares/validationError';
import authorize from '@/middlewares/authorize';
import uploadBlogBanner from '@/middlewares/upload_blog_banner';
import blogValidators from '@/middlewares/validators/blog.validators';
import userValidators from '@/middlewares/validators/user.validators';

/**
 * Controllers
 */
import BlogController from '@/controllers/v2/blog.controller';

const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 20 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and WEBP images are allowed'));
    }
    cb(null, true);
  },
});

const router = Router();
const blogController = new BlogController();

router
  .route('/')
  .get(
    authenticate,
    authorize(['admin', 'user']),
    blogValidators.getAllBlogs,
    validationError,
    blogController.getAllBlogs,
  )
  .post(
    authenticate,
    authorize(['admin']),
    upload.single('banner_image'),
    blogValidators.createBlog,
    validationError,
    uploadBlogBanner('post'),
    blogController.createBlog,
  );

router.get(
  '/user/:userId',
  authenticate,
  authorize(['admin', 'user']),
  userValidators.userId,
  blogValidators.getAllBlogs,
  validationError,
  blogController.getBlogsByUser,
);

router.get(
  '/:slug',
  authenticate,
  authorize(['admin', 'user']),
  blogValidators.slug,
  validationError,
  blogController.getBlogBySlug,
);

router
  .route('/:blogId')
  .put(
    authenticate,
    authorize(['admin']),
    blogValidators.paramId('blogId', 'Invalid blog ID'),
    validationError,
    upload.single('banner_image'),
    blogValidators.updateBlog,
    validationError,
    uploadBlogBanner('put'),
    blogController.updateBlog,
  )
  .delete(
    authenticate,
    authorize(['admin']),
    blogValidators.paramId('blogId', 'Invalid blog ID'),
    blogController.deleteBlog,
  );

export default router;
