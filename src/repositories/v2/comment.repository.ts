/**
 * Model
 */
import Comment from '@/models/comment';

/**
 * Types
 */
import type { Types } from 'mongoose';

class CommentRepository {
  async create(comment: {
    blogId: Types.ObjectId;
    userId: Types.ObjectId;
    content: string;
  }) {
    return await Comment.create(comment);
  }

  async findById(commentId: Types.ObjectId) {
    return await Comment.findById(commentId).select('-__v');
  }

  async findByBlog(blogId: Types.ObjectId, limit: number, offset: number) {
    return await Comment.find({ blogId })
      .select('-__v')
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean();
  }

  async findByUser(userId: Types.ObjectId) {
    return await Comment.find({ userId }).lean();
  }

  async delete(commentId: Types.ObjectId) {
    return await Comment.deleteOne({ _id: commentId });
  }

  async deleteByUser(userId: Types.ObjectId) {
    return await Comment.deleteMany({ userId });
  }

  async deleteByBlog(blogId: Types.ObjectId) {
    return await Comment.deleteMany({ blogId });
  }
}

export default CommentRepository;
