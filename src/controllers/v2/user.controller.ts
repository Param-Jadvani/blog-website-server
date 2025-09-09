/**
 * Node Modules
 */
import { Request, Response } from 'express';

/**
 * Custom Modules
 */
import { logger } from '@/lib/winston';

/**
 * Service
 */
import { UserService } from '@/services/v2/user.service';

/**
 * Types
 */
import { Types } from 'mongoose';

export class UserController {
  private userService = new UserService();

  getCurrentUser = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.getCurrentUser(req.userId!);
      res.status(200).json({ user });
    } catch (error: any) {
      logger.error('UserController.getCurrentUser', error);
      res.status(500).json({ message: error.message });
    }
  };

  updateCurrentUser = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.updateCurrentUser(
        req.userId!,
        req.body,
      );
      res.status(200).json({ user });
    } catch (error: any) {
      logger.error('UserController.updateCurrentUser', error);
      res.status(400).json({ message: error.message });
    }
  };

  deleteCurrentUser = async (req: Request, res: Response) => {
    try {
      await this.userService.deleteCurrentUser(req.userId!);
      res.sendStatus(204);
    } catch (error: any) {
      logger.error('UserController.deleteCurrentUser', error);
      res.status(500).json({ message: error.message });
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const result = await this.userService.getAllUsers(+limit, +offset);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('UserController.getAllUsers', error);
      res.status(500).json({ message: error.message });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.getUserById(
        new Types.ObjectId(req.params.userId),
      );
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json({ user });
    } catch (error: any) {
      logger.error('UserController.getUserById', error);
      res.status(500).json({ message: error.message });
    }
  };

  deleteUserById = async (req: Request, res: Response) => {
    try {
      await this.userService.deleteUserById(
        new Types.ObjectId(req.params.userId),
      );
      res.sendStatus(204);
    } catch (error: any) {
      logger.error('UserController.deleteUserById', error);
      res.status(500).json({ message: error.message });
    }
  };
}
