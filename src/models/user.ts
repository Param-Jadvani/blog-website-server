/**
 * Node Modules
 */
import { Schema, model } from 'mongoose';

/**
 * Custom Modules
 */
import argon2 from 'argon2';

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
  socialLinks?: {
    website?: string;
    facebook?: string;
    linkdin?: string;
    instagram?: string;
    x?: string;
    youtube?: string;
  };
}

/**
 * User Schema
 */
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required.'],
      maxLength: [20, 'Username must be less than 20 character.'],
      unique: [true, 'Username must be unique.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      maxLength: [50, 'Email must be less than 50 character.'],
      unique: [true, 'Email must be unique.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['admin', 'user'],
        message: `{VALUE} is not supported`,
      },
      default: 'user',
    },
    firstName: {
      type: String,
      maxLength: [20, 'First name must be less than 20 character.'],
    },
    lastName: {
      type: String,
      maxLength: [20, 'Last name must be less than 20 character.'],
    },
    socialLinks: {
      website: {
        type: String,
        maxLength: [100, 'Website address must be less than 100 character.'],
      },
      facebook: {
        type: String,
        maxLength: [
          100,
          'Facebook profile url must be less than 100 character.',
        ],
      },
      instagram: {
        type: String,
        maxLength: [
          100,
          'Instagram profile url must be less than 100 character.',
        ],
      },
      linkdin: {
        type: String,
        maxLength: [
          100,
          'Linkdin profile url must be less than 100 character.',
        ],
      },
      x: {
        type: String,
        maxLength: [100, 'X profile url must be less than 100 character.'],
      },
      youtube: {
        type: String,
        maxLength: [
          100,
          'Youtube channel url must be less than 100 character.',
        ],
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  // Hash the password
  this.password = await argon2.hash(this.password);
});

export default model<IUser>('User', userSchema);
