/**
 * Node Modules
 */
import { Types } from 'mongoose';
import { matchedData } from 'express-validator';

/**
 * Custom Modules
 */
import { asyncHandler } from '@/lib/async_handler';
import { sendSuccess } from '@/lib/response';

/**
 * Service
 */
import BlogService from '@/services/v2/blog.service';

/**
 * Types
 */
import type { Request, Response } from 'express';

class BlogController {
  private blogService = new BlogService();

  createBlog = asyncHandler(async (req: Request, res: Response) => {
    const blog = await this.blogService.createBlog(req.userId!, {
      ...matchedData(req, { locations: ['body'] }),
      banner: req.body.banner,
    });
    sendSuccess(res, 201, blog, 'Blog created successfully');
  });

  getAllBlogs = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 20, offset = 0 } = req.query;
    const blogs = await this.blogService.getAllBlogs(
      req.userId!,
      +limit,
      +offset,
    );
    sendSuccess(res, 200, blogs, 'Blogs fetched successfully');
  });

  getBlogsByUser = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 20, offset = 0 } = req.query;
    const blogs = await this.blogService.getBlogsByUser(
      req.userId!,
      new Types.ObjectId(req.params.userId as string),
      +limit,
      +offset,
    );
    sendSuccess(res, 200, blogs, 'User blogs fetched successfully');
  });

  getBlogBySlug = asyncHandler(async (req: Request, res: Response) => {
    const blog = await this.blogService.getBlogBySlug(
      req.userId!,
      req.params.slug as string,
    );
    sendSuccess(res, 200, blog, 'Blog fetched successfully');
  });

  updateBlog = asyncHandler(async (req: Request, res: Response) => {
    const blog = await this.blogService.updateBlog(
      req.userId!,
      new Types.ObjectId(req.params.blogId as string),
      {
        ...matchedData(req, { locations: ['body'] }),
        ...(req.body.banner ? { banner: req.body.banner } : {}),
      },
    );
    sendSuccess(res, 200, blog, 'Blog updated successfully');
  });

  deleteBlog = asyncHandler(async (req: Request, res: Response) => {
    await this.blogService.deleteBlog(
      req.userId!,
      new Types.ObjectId(req.params.blogId as string),
    );
    sendSuccess(res, 204, null, 'Blog deleted successfully');
  });
}

export default BlogController;
