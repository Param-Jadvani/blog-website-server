/**
 * Model
 */
import Token from '@/models/token';

/**
 * Types
 */
import { Types } from 'mongoose';

export class TokenRepository {
  async saveToken(userId: Types.ObjectId, token: string) {
    return await Token.create({ userId, token });
  }

  async findByToken(token: string) {
    return await Token.findOne({ token });
  }

  async deleteToken(userId: Types.ObjectId, token: string) {
    const tokenData = await Token.findOne({ token,userId });
    console.log('repo File', {
      userId: userId,
      refreshToken: token,
      tokenData,
    });
    return await Token.deleteOne({ token, userId });
  }
}
