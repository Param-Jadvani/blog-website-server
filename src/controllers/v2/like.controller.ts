/**
 * Custom Modules
 */
import { asyncHandler } from '@/lib/async_handler';
import { sendSuccess } from '@/lib/response';

/**
 * Service
 */
import LikeService from '@/services/v2/like.service';

/**
 * Types
 */
import { Types } from 'mongoose';
import type { Request, Response } from 'express';

class LikeController {
  private likeService = new LikeService();

  likeBlog = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.likeService.likeBlog(
      req.userId!,
      new Types.ObjectId(req.params.blogId as string),
    );
    sendSuccess(res, 200, result, 'Blog liked successfully');
  });

  unLikeBlog = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.likeService.unLikeBlog(
      req.userId!,
      new Types.ObjectId(req.params.blogId as string),
    );
    sendSuccess(res, 200, result, 'Blog unliked successfully');
  });
}

export default LikeController;
