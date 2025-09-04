/**
 * Cutsom Modules
 */
import { logger } from '@/lib/winston';
import config from '@/config';

/**
 * Models
 */
import User from '@/models/user';
import Blog from '@/models/blog';

/**
 * Tyoes
 */
import { Request, Response } from 'express';

interface QueryType {
  status?: 'draft' | 'published';
}

const getAllBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const limit =
      parseInt(req.query.limit as string) || config.DEFAULT_RESPONSE_LIMIT;
    const offset =
      parseInt(req.query.offset as string) || config.DEFAULT_RESPONSE_OFFSET;

    const user = await User.findById(userId).select('role').lean().exec();
    const query: QueryType = {};

    // Show only published post to a normal user
    if (user?.role === 'user') query.status = 'published';

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt -__v')
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      limit,
      offset,
      total,
      blogs,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });

    logger.error('Error while fecthing blogs', error);
  }
};

export default getAllBlogs;
