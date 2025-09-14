/**
 * Custom Modules
 */
import ParentService from '@/services/v2/parent.service';

/**
 * Error Module
 */
import { NotFoundError, AppError } from '@/lib/errors';

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

    const existingLike = await this.likeRepo.findByUserAndBlog(userId, blogId);
    if (existingLike)
      throw new AppError('Already liked this blog', 400, 'BadRequest');

    await this.likeRepo.createLike(userId, blogId);
    blog.likesCount++;
    await blog.save();

    return { likesCount: blog.likesCount };
  }

  async unLikeBlog(userId: Types.ObjectId, blogId: Types.ObjectId) {
    const existingLike = await this.likeRepo.findByUserAndBlog(userId, blogId);
    if (!existingLike) throw new NotFoundError('Like not found');

    await this.likeRepo.deleteLike(userId, blogId);

    const blog = await this.blogRepo.findById(blogId);
    if (!blog) throw new NotFoundError('Blog not found');

    blog.likesCount = Math.max(0, blog.likesCount - 1);
    await blog.save();

    return { likesCount: blog.likesCount };
  }

  async deleteLikesByUser(userId: Types.ObjectId) {
    return await this.likeRepo.deleteByUser(userId);
  }

  async deleteLikesByBlog(blogId: Types.ObjectId) {
    return await this.likeRepo.deleteByBlog(blogId);
  }
}

export default LikeService;
