/**
 * Node Modules
 */
import { Types } from 'mongoose';

/**
 * Custom Modules
 */
import { asyncHandler } from '@/lib/async_handler';
import { sendSuccess } from '@/lib/response';

/**
 * Service
 */
import UserService from '@/services/v2/user.service';

/**
 * Types
 */
import type { Request, Response } from 'express';

class UserController {
  private userService = new UserService();

  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.getCurrentUser(req.userId!);
    sendSuccess(res, 200, user, 'Current user fetched successfully');
  });

  updateCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.updateCurrentUser(
      req.userId!,
      req.body,
    );
    sendSuccess(res, 200, user, 'User updated successfully');
  });

  deleteCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    await this.userService.deleteCurrentUser(req.userId!);
    sendSuccess(res, 200, null, 'User deleted successfully');
  });

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 20, offset = 0 } = req.query;
    const result = await this.userService.getAllUsers(+limit, +offset);
    sendSuccess(res, 200, result, 'Users fetched successfully');
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const userId = new Types.ObjectId(req.params.userId);
    const user = await this.userService.getUserById(userId);
    sendSuccess(res, 200, user, 'User fetched successfully');
  });

  deleteUserById = asyncHandler(async (req: Request, res: Response) => {
    const userId = new Types.ObjectId(req.params.userId);
    await this.userService.deleteUserById(userId);
    sendSuccess(res, 200, null, 'User deleted successfully');
  });
}

export default UserController;
