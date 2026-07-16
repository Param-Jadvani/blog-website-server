/**
 * Node Modules
 */
import { Schema, model, Types } from 'mongoose';

interface IToken {
  token: string;
  userId: Types.ObjectId;
  expiresAt: Date;
}

const tokenSchema = new Schema<IToken>({
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

tokenSchema.index({ token: 1 }, { unique: true });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<IToken>('Token', tokenSchema);
