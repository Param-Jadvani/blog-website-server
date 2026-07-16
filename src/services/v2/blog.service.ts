/**
 * Node Modules
 */
import { v2 as cloudinary } from 'cloudinary';

/**
 * Custom Modules
 */
import ParentService from '@/services/v2/parent.service';

/**
 * Error Module
 */
import { AuthorizationError, NotFoundError } from '@/lib/errors';
import { sanitizeBlogContent } from '@/lib/sanitize';

/**
 * Types
 */
import type { Types } from 'mongoose';
import type { IBlog } from '@/models/blog';

class BlogService extends ParentService {
  constructor() {
    super();
  }

  async createBlog(userId: Types.ObjectId, data: Partial<IBlog>) {
    return await this.blogRepo.create({
      title: data.title!,
      content: sanitizeBlogContent(data.content!),
      banner: data.banner!,
      status: data.status || 'draft',
      author: userId,
    });
  }

  async getAllBlogs(userId: Types.ObjectId, limit: number, offset: number) {
    const user = await this.userRepo.findById(userId);
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
    const currentUser = await this.userRepo.findById(currentUserId);
    const query: any = {};

    if (currentUser?.role === 'user') query.status = 'published';

    const total = await this.blogRepo.count({ author: userId, ...query });
    const blogs = await this.blogRepo.findByUser(userId, query, limit, offset);

    return { limit, offset, total, blogs };
  }

  async getBlogBySlug(currentUserId: Types.ObjectId, slug: string) {
    const user = await this.userRepo.findById(currentUserId);
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
    const user = await this.userRepo.findById(userId);
    const blog = await this.blogRepo.findById(blogId);

    if (!blog) throw new NotFoundError('Blog not found');
    if (!user) throw new NotFoundError('User not found');

    if (blog.author.toString() !== userId.toString() && user.role !== 'admin') {
      throw new AuthorizationError('You cannot update this blog');
    }

    const safeUpdates: Partial<IBlog> = {};
    if (updates.title !== undefined) safeUpdates.title = updates.title;
    if (updates.content !== undefined)
      safeUpdates.content = sanitizeBlogContent(updates.content);
    if (updates.status !== undefined) safeUpdates.status = updates.status;
    if (updates.banner !== undefined) safeUpdates.banner = updates.banner;
    return await this.blogRepo.update(blogId, safeUpdates);
  }

  async deleteBlog(userId: Types.ObjectId, blogId: Types.ObjectId) {
    const user = await this.userRepo.findById(userId);
    const blog = await this.blogRepo.findById(blogId);

    if (!user) throw new NotFoundError('User not found');
    if (!blog) throw new NotFoundError('Blog not found');

    if (blog.author.toString() !== userId.toString() && user.role !== 'admin') {
      throw new AuthorizationError('You cannot delete this blog');
    }

    if (blog.banner?.publicId) {
      await cloudinary.uploader.destroy(blog.banner.publicId);
    }

    await this.likeRepo.deleteByBlog(blogId);
    await this.commentRepo.deleteByBlog(blogId);
    await this.blogRepo.delete(blogId);
  }
}

export default BlogService;
