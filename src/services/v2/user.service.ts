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
 * Types
 */
import { Types } from 'mongoose';
import blog from '@/models/blog';

export class UserService {
  private userRepo = new UserRepository();
  private tokenRepo = new TokenRepository();

  async getCurrentUser(userId: Types.ObjectId) {
    return await this.userRepo.findById(userId);
  }

  async updateCurrentUser(userId: Types.ObjectId, updates: any) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');

    // TODO: apply validation logic here
    return await this.userRepo.createUser({ ...user, ...updates });
  }

  async deleteCurrentUser(userId: Types.ObjectId) {
    const blogs = await Blog.find({ author: userId }).select('banner.publicId');
    const publicIds = blogs.map((b) => b.banner.publicId);
    if (publicIds.length > 0) await cloudinary.api.delete_resources(publicIds);

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
    return await this.userRepo.findById(userId);
  }

  async deleteUserById(userId: Types.ObjectId) {
    return await this.userRepo.deleteById(userId);
  }
}
