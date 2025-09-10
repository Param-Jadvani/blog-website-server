/**
 * Node Modules
 */
import { v2 as cloudinary } from 'cloudinary';

/**
 * Models
 */
import Blog from '@/models/blog';

/**
 * Repositories
 */
import { UserRepository } from '@/repositories/v2/user.repository';
import { TokenRepository } from '@/repositories/v2/token.repository';

/**
 * Error Module
 */
import { NotFoundError } from '@/lib/errors';

/**
 * Types
 */
import type { Types } from 'mongoose';

class UserService {
  private userRepo = new UserRepository();
  private tokenRepo = new TokenRepository();

  async getCurrentUser(userId: Types.ObjectId) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async updateCurrentUser(userId: Types.ObjectId, updates: any) {
    const user = await this.userRepo.updateById(userId, updates);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async deleteCurrentUser(userId: Types.ObjectId) {
    const blogs = await Blog.find({ author: userId }).select('banner.publicId');
    const publicIds = blogs.map((b) => b.banner.publicId);

    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
    }

    await Blog.deleteMany({ author: userId });
    await this.tokenRepo.deleteToken(userId, '');
    return await this.userRepo.deleteById(userId);
  }

  async getAllUsers(limit: number, offset: number) {
    const users = await this.userRepo.findAll(limit, offset);
    const total = users.length;
    return { limit, offset, total, users };
  }

  async getUserById(userId: Types.ObjectId) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async deleteUserById(userId: Types.ObjectId) {
    return await this.userRepo.deleteById(userId);
  }
}

export default UserService;
