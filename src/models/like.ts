/**
 * Node Modules
 */
import { Schema, model, Types } from 'mongoose';

interface ILike {
  blogId: Types.ObjectId;
  userId: Types.ObjectId;
  commentId?: Types.ObjectId;
}

const likeSchema = new Schema<ILike>({
  blogId: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  commentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comments',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

export default model<ILike>('Like', likeSchema);
