/**
 * Custom Modules
 */
import { logger } from '@/lib/winston';

/**
 * Models
 */
import User from '@/models/user';
import Token from '@/models/token';

/**
 * Tyoes
 */
import { Request, Response } from 'express';

const deleteCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;
  try {
    await User.deleteOne({ _id: userId });
    await Token.deleteMany({ userId });
    logger.info('A user account has been deleted', {
      userId,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while deleting current user account', error);
  }
};

export default deleteCurrentUser;
