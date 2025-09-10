/**
 * Node Modules
 */
import { Types } from 'mongoose';

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
    const blog = await this.blogService.createBlog(req.userId!, req.body);
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
      new Types.ObjectId(req.params.userId),
      +limit,
      +offset,
    );
    sendSuccess(res, 200, blogs, 'User blogs fetched successfully');
  });

  getBlogBySlug = asyncHandler(async (req: Request, res: Response) => {
    const blog = await this.blogService.getBlogBySlug(
      req.userId!,
      req.params.slug,
    );
    sendSuccess(res, 200, blog, 'Blog fetched successfully');
  });

  updateBlog = asyncHandler(async (req: Request, res: Response) => {
    const blog = await this.blogService.updateBlog(
      req.userId!,
      new Types.ObjectId(req.params.blogId),
      req.body,
    );
    sendSuccess(res, 200, blog, 'Blog updated successfully');
  });

  deleteBlog = asyncHandler(async (req: Request, res: Response) => {
    await this.blogService.deleteBlog(
      req.userId!,
      new Types.ObjectId(req.params.blogId),
    );
    sendSuccess(res, 204, null, 'Blog deleted successfully');
  });
}

export default BlogController;
