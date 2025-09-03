/**
 * Custom Modules
 */
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';
import config from '@/config';

/**
 * Custom Modules
 */
import User from '@/models/user';
import Token from '@/models/token';

/**
 * Types
 */
import type { Request, Response } from 'express';
import type { IUser } from '@/models/user';

type UserData = Pick<IUser, 'email' | 'password' | 'role'>;

const login = async (
  req: Request,
  res: Response,
): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { email } = req.body as UserData;

    const user = await User.findOne({ email })
      .select('username email password role')
      .lean()
      .exec();

    if (!user) {
      return res.status(404).json({
        code: 'Not Found',
        message: 'User not found',
      });
    }

    // const passwordMatch = await argon2.verify(user.password, password);

    // if (!passwordMatch) {
    //   return res.status(400).json({
    //     code: 'InvalidCredentials',
    //     message: 'User email or password is invalid',
    //   });
    // }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in db
    await Token.create({ token: refreshToken, userId: user._id });
    logger.info('Refresh token created for user', {
      userId: user._id,
      token: refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      message: 'User Login Successfully.',
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });

    logger.info('User login successfully', user);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error during user registration', error);
  }
};

export default login;
