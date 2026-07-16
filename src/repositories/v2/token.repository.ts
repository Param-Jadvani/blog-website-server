/**
 * Model
 */
import Token from '@/models/token';
import { createHash } from 'crypto';
import config from '@/config';

/**
 * Types
 */
import type { Types } from 'mongoose';

class TokenRepository {
  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  async saveToken(userId: Types.ObjectId, token: string) {
    return await Token.create({
      userId,
      token: this.hash(token),
      expiresAt: new Date(Date.now() + config.REFRESH_COOKIE_MAX_AGE_MS),
    });
  }

  async findByToken(token: string) {
    return await Token.findOne({ token: this.hash(token) });
  }

  async deleteToken(token: string) {
    return await Token.deleteOne({ token: this.hash(token) });
  }

  async deleteByUser(userId: Types.ObjectId) {
    return await Token.deleteMany({ userId });
  }
}

export default TokenRepository;
