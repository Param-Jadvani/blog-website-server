/**
 * Custom Modules
 */
import ParentService from '@/services/v2/parent.service';

/**
 * Error Module
 */
import { NotFoundError, AppError } from '@/lib/errors';
import { AuthorizationError } from '@/lib/errors';

/**
 * Types
 */
import type { Types } from 'mongoose';

class LikeService extends ParentService {
  constructor() {
    super();
  }

  async likeBlog(userId: Types.ObjectId, blogId: Types.ObjectId) {
    const blog = await this.blogRepo.findById(blogId);
    if (!blog) throw new NotFoundError('Blog not found');
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    if (user.role === 'user' && blog.status !== 'published')
      throw new AuthorizationError('You cannot like a draft blog');

    const existingLike = await this.likeRepo.findByUserAndBlog(userId, blogId);
    if (existingLike)
      throw new AppError('Already liked this blog', 400, 'BadRequest');

    await this.likeRepo.createLike(userId, blogId);
    const updatedBlog = await this.blogRepo.incrementCounter(
      blogId,
      'likesCount',
    );

    return { likesCount: updatedBlog?.likesCount ?? 0 };
  }

  async unLikeBlog(userId: Types.ObjectId, blogId: Types.ObjectId) {
    const existingLike = await this.likeRepo.findByUserAndBlog(userId, blogId);
    if (!existingLike) throw new NotFoundError('Like not found');

    await this.likeRepo.deleteLike(userId, blogId);

    const blog = await this.blogRepo.incrementCounter(blogId, 'likesCount', -1);
    if (!blog) throw new NotFoundError('Blog not found');

    return { likesCount: Math.max(0, blog.likesCount) };
  }

  async deleteLikesByUser(userId: Types.ObjectId) {
    return await this.likeRepo.deleteByUser(userId);
  }

  async deleteLikesByBlog(blogId: Types.ObjectId) {
    return await this.likeRepo.deleteByBlog(blogId);
  }
}

export default LikeService;
