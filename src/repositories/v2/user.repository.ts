/**
 * Model
 */
import User from '@/models/user';

/**
 * Types
 */
import type { Types } from 'mongoose';

export class UserRepository {
  async createUser(data: any) {
    return await User.create(data);
  }

  async findByEmail(email: string) {
    return await User.findOne({ email }).lean();
  }

  async findByEmailWithPassword(email: string) {
    return await User.findOne({ email }).select('+password').lean();
  }

  async findById(id: Types.ObjectId) {
    return await User.findById(id).select('-__v').lean();
  }

  async findAll(limit: number, offset: number) {
    return await User.find().select('-__v').limit(limit).skip(offset).lean();
  }

  async updateById(id: Types.ObjectId, updates: any) {
    return await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      select: '-__v',
    }).lean();
  }

  async deleteById(id: Types.ObjectId) {
    return await User.deleteOne({ _id: id });
  }
}
