/**
 * Custom Modules
 */
import { logger } from '@/lib/winston';
import uploadToCloudinary from '@/lib/cloudinary';

/**
 * Models
 */
import Blog from '@/models/blog';

/**
 * Types
 */
import type { Request, Response, NextFunction } from 'express';
import { UploadApiErrorResponse } from 'cloudinary';

/**
 * Constants
 */
const MAX_FILE_SIZE = 2 * 1024 * 1024; //2 MB

const uploadBlogBanner =
  (method: 'post' | 'put') =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (method === 'put' && !req.file) return next();

    if (!req.file)
      return res.status(400).json({
        code: 'ValidationError',
        message: 'Blog banner is required',
      });

    if (req.file.size > MAX_FILE_SIZE)
      return res.status(413).json({
        code: 'ValidationError',
        message: 'File size must be less than 2MB',
      });

    try {
      const { blogId } = req.params;
      const blog = await Blog.findById(blogId).select('banner.publicId').exec();

      const data = await uploadToCloudinary(
        req.file.buffer,
        blog?.banner.publicId.replace('blog-api/', ''),
      );

      if (!data) {
        res.status(500).json({
          code: 'ServerError',
          message: 'Internal server error',
        });

        logger.error('Error while uploading the blog banner to cloudinary', {
          blogId,
          publicId: blog?.banner.publicId,
        });
        return;
      }

      const newBanner = {
        publicId: data.public_id,
        url: data.secure_url,
        width: data.width,
        height: data.height,
      };

      logger.info('Blog banner uploaded to cloudinary', {
        blogId,
        banner: newBanner,
      });

      req.body.banner = newBanner;

      next();
    } catch (error: unknown) {
      logger.error('Error while uploading blog banner to cloudinary', error);
      next(error);
    }
  };

export default uploadBlogBanner;
