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
import { NotFoundError } from '@/lib/errors';

/**
 * Types
 */
import type { Types } from 'mongoose';

class UserService extends ParentService {
  constructor() {
    super();
  }

  async getCurrentUser(userId: Types.ObjectId) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async updateCurrentUser(
    userId: Types.ObjectId,
    updates: {
      username?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      socialLinks?: Record<string, string>;
    },
  ) {
    const user = await this.userRepo.updateById(userId, updates);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async deleteCurrentUser(userId: Types.ObjectId) {
    return await this.deleteUserAndResources(userId);
  }

  private async deleteUserAndResources(userId: Types.ObjectId) {
    const blogs = await this.blogRepo.findUserBlogs(userId);
    const publicIds = blogs.map((b) => b.banner.publicId);
    const comments = await this.commentRepo.findByUser(userId);
    const ownedBlogIds = new Set(blogs.map((blog) => blog._id.toString()));

    const commentCounts = new Map<
      string,
      { blogId: Types.ObjectId; count: number }
    >();
    for (const comment of comments) {
      if (ownedBlogIds.has(comment.blogId.toString())) continue;
      const key = comment.blogId.toString();
      const current = commentCounts.get(key);
      commentCounts.set(key, {
        blogId: comment.blogId,
        count: (current?.count || 0) + 1,
      });
    }

    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
    }

    await this.tokenRepo.deleteByUser(userId);
    await this.likeRepo.deleteByUser(userId);
    await this.commentRepo.deleteByUser(userId);
    await Promise.all(
      [...commentCounts.values()].map(({ blogId, count }) =>
        this.blogRepo.incrementCounter(blogId, 'commentsCount', -count),
      ),
    );
    await Promise.all(
      blogs.map(async (blog) => {
        await this.likeRepo.deleteByBlog(blog._id);
        await this.commentRepo.deleteByBlog(blog._id);
      }),
    );
    await this.blogRepo.deleteByUser(userId);
    return await this.userRepo.deleteById(userId);
  }

  async getAllUsers(limit: number, offset: number) {
    const [users, total] = await Promise.all([
      this.userRepo.findAll(limit, offset),
      this.userRepo.count(),
    ]);
    return { limit, offset, total, users };
  }

  async getUserById(userId: Types.ObjectId) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async deleteUserById(userId: Types.ObjectId) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (user.role === 'admin')
      throw new NotFoundError('Cannot delete admin user');

    return await this.deleteUserAndResources(userId);
  }
}

export default UserService;
