jest.mock('cloudinary', () => ({
  v2: { api: { delete_resources: jest.fn() } },
}));

jest.mock('@/services/v2/parent.service', () => ({
  __esModule: true,
  default: class ParentService {},
}));

import UserService from '@/services/v2/user.service';
import { NotFoundError } from '@/lib/errors';

const id = (value: string) => ({ toString: () => value }) as any;
const userId = id('user');

describe('UserService', () => {
  const createService = () => {
    const service = new UserService() as any;
    service.userRepo = {
      findById: jest.fn(),
      updateById: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      deleteById: jest.fn(),
    };
    service.blogRepo = {
      findUserBlogs: jest.fn(),
      incrementCounter: jest.fn(),
      deleteByUser: jest.fn(),
    };
    service.commentRepo = {
      findByUser: jest.fn(),
      deleteByUser: jest.fn(),
      deleteByBlog: jest.fn(),
    };
    service.likeRepo = { deleteByUser: jest.fn(), deleteByBlog: jest.fn() };
    service.tokenRepo = { deleteByUser: jest.fn() };
    return service;
  };

  it('returns current users and reports absent users consistently', async () => {
    const service = createService();
    service.userRepo.findById.mockResolvedValue({
      _id: userId,
      username: 'user',
    });
    await expect(service.getCurrentUser(userId)).resolves.toEqual({
      _id: userId,
      username: 'user',
    });

    service.userRepo.findById.mockResolvedValue(null);
    await expect(service.getCurrentUser(userId)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('returns a real total alongside a paginated user list', async () => {
    const service = createService();
    service.userRepo.findAll.mockResolvedValue([{ _id: userId }]);
    service.userRepo.count.mockResolvedValue(11);

    await expect(service.getAllUsers(1, 2)).resolves.toEqual({
      limit: 1,
      offset: 2,
      total: 11,
      users: [{ _id: userId }],
    });
  });

  it('does not permit deleting administrator accounts', async () => {
    const service = createService();
    service.userRepo.findById.mockResolvedValue({ role: 'admin' });
    await expect(service.deleteUserById(userId)).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(service.userRepo.deleteById).not.toHaveBeenCalled();
  });

  it('updates existing users and rejects missing update targets', async () => {
    const service = createService();
    service.userRepo.updateById.mockResolvedValue({
      _id: userId,
      firstName: 'Ada',
    });
    await expect(
      service.updateCurrentUser(userId, { firstName: 'Ada' }),
    ).resolves.toEqual({ _id: userId, firstName: 'Ada' });
    service.userRepo.updateById.mockResolvedValue(null);
    await expect(
      service.updateCurrentUser(userId, { firstName: 'Ada' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('returns users by id and deletes a regular user with related resources', async () => {
    const service = createService();
    const ownedBlogId = id('owned-blog');
    const externalBlogId = id('external-blog');
    service.userRepo.findById.mockResolvedValue({ _id: userId, role: 'user' });
    await expect(service.getUserById(userId)).resolves.toEqual({
      _id: userId,
      role: 'user',
    });

    service.blogRepo.findUserBlogs.mockResolvedValue([
      { _id: ownedBlogId, banner: { publicId: 'banner-1' } },
    ]);
    service.commentRepo.findByUser.mockResolvedValue([
      { blogId: ownedBlogId },
      { blogId: externalBlogId },
      { blogId: externalBlogId },
    ]);
    service.userRepo.deleteById.mockResolvedValue({ deletedCount: 1 });
    await expect(service.deleteUserById(userId)).resolves.toEqual({
      deletedCount: 1,
    });
    expect(service.blogRepo.incrementCounter).toHaveBeenCalledWith(
      externalBlogId,
      'commentsCount',
      -2,
    );
    expect(service.likeRepo.deleteByBlog).toHaveBeenCalledWith(ownedBlogId);

    service.userRepo.findById.mockResolvedValue(null);
    await expect(service.getUserById(userId)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('deletes the current user when no blogs or comments exist', async () => {
    const service = createService();
    service.blogRepo.findUserBlogs.mockResolvedValue([]);
    service.commentRepo.findByUser.mockResolvedValue([]);
    service.userRepo.deleteById.mockResolvedValue({ deletedCount: 1 });
    await service.deleteCurrentUser(userId);
    expect(service.blogRepo.deleteByUser).toHaveBeenCalledWith(userId);
  });

  it('rejects deleting a user that no longer exists', async () => {
    const service = createService();
    service.userRepo.findById.mockResolvedValue(null);
    await expect(service.deleteUserById(userId)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
