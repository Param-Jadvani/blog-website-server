/**
 * Node Modules
 */
import { v2 as cloudinary } from 'cloudinary';

/**
 * Custom Modules
 */
import ParentService from '@/services/v2/parent.service';

/**
 * Error Module
 */
import { NotFoundError } from '@/lib/errors';

/**
 * Types
 */
import type { Types } from 'mongoose';

class UserService extends ParentService {
  constructor() {
    super();
  }

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
    const blogs = await this.blogRepo.findUserBlogs(userId);
    const publicIds = blogs.map((b) => b.banner.publicId);

    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
    }

    await this.blogRepo.deleteByUser(userId);
    await this.tokenRepo.deleteByUser(userId);
    await this.likeRepo.deleteByUser(userId);
    await this.commentRepo.deleteByUser(userId);
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
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (user.role === 'admin')
      throw new NotFoundError('Cannot delete admin user');

    // 3. Delete related entities
    await this.tokenRepo.deleteByUser(userId);
    await this.likeRepo.deleteByUser(userId);
    await this.commentRepo.deleteByUser(userId);

    return await this.userRepo.deleteById(userId);
  }
}

export default UserService;
