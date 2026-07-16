/**
 * Custom Modules
 */
import ParentService from '@/services/v2/parent.service';

/**
 * Error Module
 */
import { NotFoundError, AuthorizationError } from '@/lib/errors';

/**
 * Repositories
 */
import CommentRepository from '@/repositories/v2/comment.repository';
import BlogRepository from '@/repositories/v2/blog.repository';

/**
 * Types
 */
import type { Types } from 'mongoose';

class CommentService extends ParentService {
  constructor() {
    super();
  }

  async createComment(
    userId: Types.ObjectId,
    blogId: Types.ObjectId,
    content: string,
  ) {
    const blog = await this.blogRepo.findById(blogId);
    if (!blog) throw new NotFoundError('Blog not found');

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    if (user.role === 'user' && blog.status !== 'published')
      throw new AuthorizationError('You cannot comment on a draft blog');

    const comment = await this.commentRepo.create({
      blogId,
      userId,
      content,
    });

    await this.blogRepo.incrementCounter(blogId, 'commentsCount');

    return comment;
  }

  async updateComment(
    userId: Types.ObjectId,
    commentId: Types.ObjectId,
    content: string,
  ) {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw new NotFoundError('Comment not found');

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    if (
      comment.userId.toString() !== userId.toString() &&
      user.role !== 'admin'
    ) {
      throw new AuthorizationError('You cannot edit this comment');
    }

    (comment as any).content = content;
    await (comment as any).save();
    return comment;
  }

  async deleteComment(userId: Types.ObjectId, commentId: Types.ObjectId) {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw new NotFoundError('Comment not found');

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    if (
      comment.userId.toString() !== userId.toString() &&
      user.role !== 'admin'
    )
      throw new AuthorizationError('You cannot delete this comment');

    await this.commentRepo.delete(commentId);
    await this.blogRepo.incrementCounter(comment.blogId, 'commentsCount', -1);

    return { deleted: true };
  }

  async getCommentsByBlog(
    userId: Types.ObjectId,
    blogId: Types.ObjectId,
    limit: number,
    offset: number,
  ) {
    const blog = await this.blogRepo.findById(blogId);
    if (!blog) throw new NotFoundError('Blog not found');
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    if (user.role === 'user' && blog.status !== 'published')
      throw new AuthorizationError(
        'You cannot access comments on a draft blog',
      );
    return await this.commentRepo.findByBlog(blogId, limit, offset);
  }

  async deleteCommentsByUser(userId: Types.ObjectId) {
    return await this.commentRepo.deleteByUser(userId);
  }

  async deleteCommentsByBlog(blogId: Types.ObjectId) {
    return await this.commentRepo.deleteByBlog(blogId);
  }
}

export default CommentService;
