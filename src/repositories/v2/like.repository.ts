/**
 * Model
 */
import Like from '@/models/like';

/**
 * Types
 */
import type { Types } from 'mongoose';

class LikeRepository {
  async findByUserAndBlog(userId: Types.ObjectId, blogId: Types.ObjectId) {
    return await Like.findOne({ userId, blogId }).lean();
  }

  async createLike(userId: Types.ObjectId, blogId: Types.ObjectId) {
    return await Like.create({ userId, blogId });
  }

  async deleteLike(userId: Types.ObjectId, blogId: Types.ObjectId) {
    return await Like.deleteOne({ userId, blogId });
  }

  async deleteByUser(userId: Types.ObjectId) {
    return await Like.deleteMany({ userId });
  }

  async deleteByBlog(blogId: Types.ObjectId) {
    return await Like.deleteMany({ blogId });
  }
}

export default LikeRepository;
