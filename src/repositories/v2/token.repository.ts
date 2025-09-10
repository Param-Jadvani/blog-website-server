/**
 * Model
 */
import Token from '@/models/token';

/**
 * Types
 */
import type { Types } from 'mongoose';

export class TokenRepository {
  async saveToken(userId: Types.ObjectId, token: string) {
    return await Token.create({ userId, token });
  }

  async findByToken(token: string) {
    return await Token.findOne({ token });
  }

  async deleteToken(userId: Types.ObjectId, token: string) {
    return await Token.deleteOne({ userId, token });
  }
}
