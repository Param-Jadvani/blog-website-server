jest.mock('@/services/v2/parent.service', () => ({
  __esModule: true,
  default: class ParentService {},
}));

import CommentService from '@/services/v2/comment.service';
import LikeService from '@/services/v2/like.service';
import { AppError, AuthorizationError, NotFoundError } from '@/lib/errors';

const id = (value: string) => ({ toString: () => value }) as any;
const userId = id('user');
const otherUserId = id('other');
const blogId = id('blog');
const commentId = id('comment');

describe('CommentService', () => {
  const createService = () => {
    const service = new CommentService() as any;
    service.userRepo = { findById: jest.fn() };
    service.blogRepo = { findById: jest.fn(), incrementCounter: jest.fn() };
    service.commentRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      findByBlog: jest.fn(),
      deleteByUser: jest.fn(),
      deleteByBlog: jest.fn(),
    };
    return service;
  };

  it('does not let a normal user comment on drafts', async () => {
    const service = createService();
    service.blogRepo.findById.mockResolvedValue({ status: 'draft' });
    service.userRepo.findById.mockResolvedValue({ role: 'user' });
    await expect(
      service.createComment(userId, blogId, 'hello'),
    ).rejects.toBeInstanceOf(AuthorizationError);
  });

  it('creates a published-blog comment and increments its counter', async () => {
    const service = createService();
    service.blogRepo.findById.mockResolvedValue({ status: 'published' });
    service.userRepo.findById.mockResolvedValue({ role: 'user' });
    service.commentRepo.create.mockResolvedValue({ _id: commentId });
    await expect(
      service.createComment(userId, blogId, 'hello'),
    ).resolves.toEqual({ _id: commentId });
    expect(service.blogRepo.incrementCounter).toHaveBeenCalledWith(
      blogId,
      'commentsCount',
    );
  });

  it('prevents non-owners from deleting comments while allowing administrators', async () => {
    const service = createService();
    service.commentRepo.findById.mockResolvedValue({
      userId: otherUserId,
      blogId,
    });
    service.userRepo.findById.mockResolvedValue({ role: 'user' });
    await expect(
      service.deleteComment(userId, commentId),
    ).rejects.toBeInstanceOf(AuthorizationError);

    service.userRepo.findById.mockResolvedValue({ role: 'admin' });
    await expect(service.deleteComment(userId, commentId)).resolves.toEqual({
      deleted: true,
    });
    expect(service.blogRepo.incrementCounter).toHaveBeenCalledWith(
      blogId,
      'commentsCount',
      -1,
    );
  });

  it('allows owners to update their comments', async () => {
    const service = createService();
    const comment = { userId, blogId, content: 'old', save: jest.fn() };
    service.commentRepo.findById.mockResolvedValue(comment);
    service.userRepo.findById.mockResolvedValue({ role: 'user' });
    await expect(service.updateComment(userId, commentId, 'new')).resolves.toBe(
      comment,
    );
    expect(comment.save).toHaveBeenCalled();
  });

  it('rejects comment updates by non-owners and missing comments', async () => {
    const service = createService();
    service.userRepo.findById.mockResolvedValue({ role: 'user' });
    service.commentRepo.findById.mockResolvedValue({ userId: otherUserId });
    await expect(
      service.updateComment(userId, commentId, 'new'),
    ).rejects.toBeInstanceOf(AuthorizationError);
    service.commentRepo.findById.mockResolvedValue(null);
    await expect(
      service.updateComment(userId, commentId, 'new'),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('enforces blog visibility when listing comments and delegates cleanup', async () => {
    const service = createService();
    service.userRepo.findById.mockResolvedValue({ role: 'user' });
    service.blogRepo.findById.mockResolvedValue({ status: 'draft' });
    await expect(
      service.getCommentsByBlog(userId, blogId, 10, 0),
    ).rejects.toBeInstanceOf(AuthorizationError);
    service.blogRepo.findById.mockResolvedValue({ status: 'published' });
    service.commentRepo.findByBlog.mockResolvedValue(['comment']);
    await expect(
      service.getCommentsByBlog(userId, blogId, 10, 0),
    ).resolves.toEqual(['comment']);

    service.blogRepo.findById.mockResolvedValue(null);
    await expect(
      service.getCommentsByBlog(userId, blogId, 10, 0),
    ).rejects.toBeInstanceOf(NotFoundError);

    await service.deleteCommentsByUser(userId);
    await service.deleteCommentsByBlog(blogId);
    expect(service.commentRepo.deleteByUser).toHaveBeenCalledWith(userId);
    expect(service.commentRepo.deleteByBlog).toHaveBeenCalledWith(blogId);
  });
});

describe('CommentService error paths', () => {
  const createService = () => {
    const service = new CommentService() as any;
    service.userRepo = { findById: jest.fn() };
    service.blogRepo = { findById: jest.fn(), incrementCounter: jest.fn() };
    service.commentRepo = { findById: jest.fn() };
    return service;
  };

  it('returns not-found errors for missing blogs, users, and comments', async () => {
    const service = createService();
    service.blogRepo.findById.mockResolvedValue(null);
    await expect(
      service.createComment(userId, blogId, 'x'),
    ).rejects.toBeInstanceOf(NotFoundError);
    service.blogRepo.findById.mockResolvedValue({ status: 'published' });
    service.userRepo.findById.mockResolvedValue(null);
    await expect(
      service.createComment(userId, blogId, 'x'),
    ).rejects.toBeInstanceOf(NotFoundError);
    service.commentRepo.findById.mockResolvedValue(null);
    await expect(
      service.updateComment(userId, commentId, 'x'),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      service.deleteComment(userId, commentId),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      service.getCommentsByBlog(userId, blogId, 1, 0),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('LikeService', () => {
  const createService = () => {
    const service = new LikeService() as any;
    service.userRepo = { findById: jest.fn() };
    service.blogRepo = { findById: jest.fn(), incrementCounter: jest.fn() };
    service.likeRepo = {
      findByUserAndBlog: jest.fn(),
      createLike: jest.fn(),
      deleteLike: jest.fn(),
      deleteByUser: jest.fn(),
      deleteByBlog: jest.fn(),
    };
    return service;
  };

  it('rejects likes for a missing blog, drafts, and duplicate likes', async () => {
    const service = createService();
    service.blogRepo.findById.mockResolvedValue(null);
    await expect(service.likeBlog(userId, blogId)).rejects.toBeInstanceOf(
      NotFoundError,
    );

    service.blogRepo.findById.mockResolvedValue({ status: 'draft' });
    service.userRepo.findById.mockResolvedValue({ role: 'user' });
    await expect(service.likeBlog(userId, blogId)).rejects.toBeInstanceOf(
      AuthorizationError,
    );

    service.blogRepo.findById.mockResolvedValue({ status: 'published' });
    service.likeRepo.findByUserAndBlog.mockResolvedValue({ _id: id('like') });
    await expect(service.likeBlog(userId, blogId)).rejects.toBeInstanceOf(
      AppError,
    );

    service.userRepo.findById.mockResolvedValue(null);
    service.likeRepo.findByUserAndBlog.mockResolvedValue(null);
    await expect(service.likeBlog(userId, blogId)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('creates and removes likes while updating the aggregate count', async () => {
    const service = createService();
    service.blogRepo.findById.mockResolvedValue({ status: 'published' });
    service.userRepo.findById.mockResolvedValue({ role: 'user' });
    service.likeRepo.findByUserAndBlog.mockResolvedValue(null);
    service.blogRepo.incrementCounter.mockResolvedValue({ likesCount: 3 });
    await expect(service.likeBlog(userId, blogId)).resolves.toEqual({
      likesCount: 3,
    });

    service.blogRepo.incrementCounter.mockResolvedValue(undefined);
    await expect(service.likeBlog(userId, blogId)).resolves.toEqual({
      likesCount: 0,
    });

    service.likeRepo.findByUserAndBlog.mockResolvedValue({ _id: id('like') });
    service.blogRepo.incrementCounter.mockResolvedValue({ likesCount: -1 });
    await expect(service.unLikeBlog(userId, blogId)).resolves.toEqual({
      likesCount: 0,
    });
    expect(service.blogRepo.incrementCounter).toHaveBeenLastCalledWith(
      blogId,
      'likesCount',
      -1,
    );
  });

  it('rejects invalid unlike operations and delegates cleanup', async () => {
    const service = createService();
    service.likeRepo.findByUserAndBlog.mockResolvedValue(null);
    await expect(service.unLikeBlog(userId, blogId)).rejects.toBeInstanceOf(
      NotFoundError,
    );

    service.likeRepo.findByUserAndBlog.mockResolvedValue({ _id: id('like') });
    service.blogRepo.incrementCounter.mockResolvedValue(null);
    await expect(service.unLikeBlog(userId, blogId)).rejects.toBeInstanceOf(
      NotFoundError,
    );

    await service.deleteLikesByUser(userId);
    await service.deleteLikesByBlog(blogId);
    expect(service.likeRepo.deleteByUser).toHaveBeenCalledWith(userId);
    expect(service.likeRepo.deleteByBlog).toHaveBeenCalledWith(blogId);
  });
});
