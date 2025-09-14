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

    const comment = await this.commentRepo.create({
      blogId,
      userId,
      content,
    });

    blog.commentsCount = (blog.commentsCount || 0) + 1;
    await blog.save();

    return comment;
  }

  async updateComment(
    userId: Types.ObjectId,
    commentId: Types.ObjectId,
    content: string,
  ) {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw new NotFoundError('Comment not found');

    if (comment.userId.toString() !== userId.toString()) {
      throw new AuthorizationError('You cannot edit this comment');
    }

    (comment as any).content = content;
    await (comment as any).save();
    return comment;
  }

  async deleteComment(userId: Types.ObjectId, commentId: Types.ObjectId) {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw new NotFoundError('Comment not found');

    await this.commentRepo.delete(commentId);

    const blog = await this.blogRepo.findById(comment.blogId);
    if (blog) {
      blog.commentsCount = Math.max(0, (blog.commentsCount || 1) - 1);
      await blog.save();
    }

    return { deleted: true };
  }

  async getCommentsByBlog(
    blogId: Types.ObjectId,
    limit: number,
    offset: number,
  ) {
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
