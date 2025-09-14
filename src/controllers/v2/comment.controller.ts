/**
 * Custom Modules
 */
import { asyncHandler } from '@/lib/async_handler';
import { sendSuccess } from '@/lib/response';
import { logger } from '@/lib/winston';

/**
 * Service
 */
import CommentService from '@/services/v2/comment.service';

/**
 * Types
 */
import type { Request, Response } from 'express';
import { Types } from 'mongoose';

class CommentController {
  private commentService = new CommentService();

  createComment = asyncHandler(async (req: Request, res: Response) => {
    const blogId = new Types.ObjectId(req.params.blogId);
    const comment = await this.commentService.createComment(
      req.userId!,
      blogId,
      req.body.content,
    );
    logger.info('Comment created', {
      commentId: comment._id,
      userId: req.userId,
    });
    sendSuccess(res, 201, comment, 'Comment created successfully');
  });

  updateComment = asyncHandler(async (req: Request, res: Response) => {
    const commentId = new Types.ObjectId(req.params.commentId);
    const updated = await this.commentService.updateComment(
      req.userId!,
      commentId,
      req.body.content,
    );
    sendSuccess(res, 200, updated, 'Comment updated successfully');
  });

  deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const commentId = new Types.ObjectId(req.params.commentId);
    const result = await this.commentService.deleteComment(
      req.userId!,
      commentId,
    );
    sendSuccess(res, 200, result, 'Comment deleted successfully');
  });

  getCommentsByBlog = asyncHandler(async (req: Request, res: Response) => {
    const blogId = new Types.ObjectId(req.params.blogId);
    const { limit = 20, offset = 0 } = req.query;
    const comments = await this.commentService.getCommentsByBlog(
      blogId,
      +limit,
      +offset,
    );
    sendSuccess(
      res,
      200,
      { limit: +limit, offset: +offset, comments },
      'Comments fetched successfully',
    );
  });
}

export default CommentController;
