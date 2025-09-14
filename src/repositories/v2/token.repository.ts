/**
 * Model
 */
import Token from '@/models/token';

/**
 * Types
 */
import type { Types } from 'mongoose';

class TokenRepository {
  async saveToken(userId: Types.ObjectId, token: string) {
    return await Token.create({ userId, token });
  }

  async findByToken(token: string) {
    return await Token.findOne({ token });
  }

  async deleteToken(userId: Types.ObjectId, token: string) {
    return await Token.deleteOne({ userId, token });
  }

  async deleteByUser(userId: Types.ObjectId) {
    return await Token.deleteMany({ userId });
  }
}

export default TokenRepository;
