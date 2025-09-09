/**
 * Node Modules
 */
import argon2 from 'argon2';

/**
 * Custom Modules
 */
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/lib/jwt';

/**
 * Repositories
 */
import { UserRepository } from '@/repositories/v2/user.repository';
import { TokenRepository } from '@/repositories/v2/token.repository';

/**
 * Types
 */
import { Types } from 'mongoose';

export class AuthService {
  private userRepo = new UserRepository();
  private tokenRepo = new TokenRepository();

  async register(data: { email: string; password: string; role?: string }) {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) throw { statusCode: 400, message: 'User already exists' };

    const user = await this.userRepo.createUser(data);
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await this.tokenRepo.saveToken(user._id, refreshToken);

    return {
      message: 'User registered successfully',
      user: { username: user.username, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userRepo.findByEmailWithPassword(data.email);
    if (!user) throw { statusCode: 401, message: 'Invalid credentials' };

    const match = await argon2.verify(user.password, data.password);
    if (!match) throw { statusCode: 401, message: 'Invalid credentials' };

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await this.tokenRepo.saveToken(user._id, refreshToken);

    return {
      message: 'Login successful',
      user: { username: user.username, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) throw { statusCode: 401, message: 'No refresh token' };

    const tokenRecord = await this.tokenRepo.findByToken(refreshToken);
    if (!tokenRecord)
      throw { statusCode: 401, message: 'Invalid refresh token' };

    const payload = verifyRefreshToken(refreshToken) as {
      userId: Types.ObjectId;
    };
    return generateAccessToken(payload.userId);
  }

  async logout(refreshToken: string, userId: Types.ObjectId) {
    await this.tokenRepo.deleteToken(userId, refreshToken);
  }
}
