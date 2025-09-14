/**
 * Model
 */
import Blog from '@/models/blog';

/**
 * Types
 */
import type { IBlog } from '@/models/blog';
import type { Types } from 'mongoose';

class BlogRepository {
  async create(data: Partial<IBlog>) {
    return await Blog.create(data);
  }

  async findAll(query: any, limit: number, offset: number) {
    return await Blog.find(query)
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt -__v')
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean();
  }

  async count(query: any) {
    return await Blog.countDocuments(query);
  }

  async findById(blogId: Types.ObjectId) {
    return await Blog.findById(blogId).select('-__v');
  }

  async findBySlug(slug: string) {
    return await Blog.findOne({ slug })
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt -__v')
      .lean();
  }

  async findByUser(
    userId: Types.ObjectId,
    query: any,
    limit: number,
    offset: number,
  ) {
    return await Blog.find({ author: userId, ...query })
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt -__v')
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean();
  }

  async delete(blogId: Types.ObjectId) {
    return await Blog.deleteOne({ _id: blogId });
  }

  async update(blogId: Types.ObjectId, updates: Partial<IBlog>) {
    return await Blog.findByIdAndUpdate(blogId, updates, { new: true });
  }

  async deleteByUser(userId: Types.ObjectId) {
    return await Blog.deleteMany({ author: userId });
  }

  async findUserBlogs(userId: Types.ObjectId) {
    return await Blog.find({ author: userId }).select('banner.publicId');
  }
}

export default BlogRepository;
