/**
 * Node Modules
 */
import { v2 as cloudinary } from 'cloudinary';

/**
 * Error Module
 */
import { AuthorizationError, NotFoundError } from '@/lib/errors';

/**
 * Models
 */
import User from '@/models/user';

/**
 * Repositories
 */
import { BlogRepository } from '@/repositories/v2/blog.repository';

/**
 * Types
 */
import type { Types } from 'mongoose';
import type { IBlog } from '@/models/blog';

class BlogService {
  private blogRepo = new BlogRepository();

  async createBlog(userId: Types.ObjectId, data: Partial<IBlog>) {
    return await this.blogRepo.create({ ...data, author: userId });
  }

  async getAllBlogs(userId: Types.ObjectId, limit: number, offset: number) {
    const user = await User.findById(userId).select('role').lean();
    const query: any = {};

    if (user?.role === 'user') query.status = 'published';

    const total = await this.blogRepo.count(query);
    const blogs = await this.blogRepo.findAll(query, limit, offset);

    return { limit, offset, total, blogs };
  }

  async getBlogsByUser(
    currentUserId: Types.ObjectId,
    userId: Types.ObjectId,
    limit: number,
    offset: number,
  ) {
    const currentUser = await User.findById(currentUserId)
      .select('role')
      .lean();
    const query: any = {};

    if (currentUser?.role === 'user') query.status = 'published';

    const total = await this.blogRepo.count({ author: userId, ...query });
    const blogs = await this.blogRepo.findByUser(userId, query, limit, offset);

    return { limit, offset, total, blogs };
  }

  async getBlogBySlug(currentUserId: Types.ObjectId, slug: string) {
    const user = await User.findById(currentUserId).select('role').lean();
    const blog = await this.blogRepo.findBySlug(slug);

    if (!blog) throw new NotFoundError('Blog not found');

    if (user?.role === 'user' && blog.status === 'draft') {
      throw new AuthorizationError('You cannot access a draft blog');
    }

    return blog;
  }

  async updateBlog(
    userId: Types.ObjectId,
    blogId: Types.ObjectId,
    updates: Partial<IBlog>,
  ) {
    const user = await User.findById(userId).select('role').lean();
    const blog = await this.blogRepo.findById(blogId);

    if (!blog) throw new NotFoundError('Blog not found');
    if (!user) throw new NotFoundError('User not found');

    if (blog.author.toString() !== userId.toString() && user.role !== 'admin') {
      throw new AuthorizationError('You cannot update this blog');
    }

    return await this.blogRepo.update(blogId, updates);
  }

  async deleteBlog(userId: Types.ObjectId, blogId: Types.ObjectId) {
    const user = await User.findById(userId).select('role').lean();
    const blog = await this.blogRepo.findById(blogId);

    if (!user) throw new NotFoundError('User not found');
    if (!blog) throw new NotFoundError('Blog not found');

    if (blog.author.toString() !== userId.toString() && user.role !== 'admin') {
      throw new AuthorizationError('You cannot delete this blog');
    }

    if (blog.banner?.publicId) {
      await cloudinary.uploader.destroy(blog.banner.publicId);
    }

    await this.blogRepo.delete(blogId);
  }
}

export default BlogService;
