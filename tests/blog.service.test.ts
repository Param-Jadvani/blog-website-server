jest.mock('@/lib/sanitize', () => ({
  sanitizeBlogContent: jest.fn((content: string) => `safe:${content}`),
}));

jest.mock('@/services/v2/parent.service', () => ({
  __esModule: true,
  default: class ParentService {},
}));

jest.mock('cloudinary', () => ({
  v2: { uploader: { destroy: jest.fn() } },
}));

import BlogService from '@/services/v2/blog.service';
import { AuthorizationError, NotFoundError } from '@/lib/errors';
import { sanitizeBlogContent } from '@/lib/sanitize';

const id = (value: string) => ({ toString: () => value }) as any;
const authorId = id('author');
const otherId = id('other');
const blogId = id('blog');
const draftBlog = {
  _id: blogId,
  author: authorId,
  status: 'draft',
  banner: { publicId: 'banner' },
};

describe('BlogService', () => {
  const createService = () => {
    const service = new BlogService() as any;
    service.userRepo = { findById: jest.fn() };
    service.blogRepo = {
      create: jest.fn(),
      count: jest.fn(),
      findAll: jest.fn(),
      findByUser: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service.likeRepo = { deleteByBlog: jest.fn() };
    service.commentRepo = { deleteByBlog: jest.fn() };
    return service;
  };

  it('sanitizes content and assigns the authenticated author on creation', async () => {
    const service = createService();
    service.blogRepo.create.mockResolvedValue({ _id: blogId });

    await service.createBlog(authorId, {
      title: 'Title',
      content: '<script>x</script>',
      banner: { publicId: 'p' },
      status: 'published',
    });

    expect(sanitizeBlogContent).toHaveBeenCalledWith('<script>x</script>');
    expect(service.blogRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        author: authorId,
        content: 'safe:<script>x</script>',
        status: 'published',
      }),
    );
  });

  it('restricts ordinary users to published listings and drafts are unreadable', async () => {
    const service = createService();
    service.userRepo.findById.mockResolvedValue({ role: 'user' });
    service.blogRepo.count.mockResolvedValue(1);
    service.blogRepo.findAll.mockResolvedValue(['published-blog']);

    await expect(service.getAllBlogs(authorId, 20, 0)).resolves.toEqual({
      limit: 20,
      offset: 0,
      total: 1,
      blogs: ['published-blog'],
    });
    expect(service.blogRepo.findAll).toHaveBeenCalledWith(
      { status: 'published' },
      20,
      0,
    );

    service.blogRepo.findBySlug.mockResolvedValue(draftBlog);
    await expect(
      service.getBlogBySlug(authorId, 'draft'),
    ).rejects.toBeInstanceOf(AuthorizationError);

    service.userRepo.findById.mockResolvedValue({ role: 'admin' });
    await expect(service.getBlogBySlug(authorId, 'draft')).resolves.toBe(
      draftBlog,
    );
  });

  it('applies the same visibility filter to author listings and handles missing slugs', async () => {
    const service = createService();
    service.userRepo.findById.mockResolvedValue({ role: 'user' });
    service.blogRepo.count.mockResolvedValue(2);
    service.blogRepo.findByUser.mockResolvedValue(['published-blog']);

    await expect(
      service.getBlogsByUser(authorId, otherId, 5, 10),
    ).resolves.toEqual({
      limit: 5,
      offset: 10,
      total: 2,
      blogs: ['published-blog'],
    });
    expect(service.blogRepo.count).toHaveBeenCalledWith({
      author: otherId,
      status: 'published',
    });

    service.blogRepo.findBySlug.mockResolvedValue(null);
    await expect(
      service.getBlogBySlug(authorId, 'missing'),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('allows only the author or an admin to update and only persists allowed fields', async () => {
    const service = createService();
    service.blogRepo.findById.mockResolvedValue(draftBlog);
    service.userRepo.findById.mockResolvedValue({ role: 'user' });

    await expect(
      service.updateBlog(otherId, blogId, { title: 'Nope' }),
    ).rejects.toBeInstanceOf(AuthorizationError);

    service.userRepo.findById.mockResolvedValue({ role: 'admin' });
    await service.updateBlog(otherId, blogId, {
      title: 'Updated',
      content: '<b>content</b>',
      author: otherId,
      likesCount: 99,
    });
    expect(service.blogRepo.update).toHaveBeenCalledWith(blogId, {
      title: 'Updated',
      content: 'safe:<b>content</b>',
    });
  });

  it('fails with a not-found error before attempting to update a missing blog', async () => {
    const service = createService();
    service.blogRepo.findById.mockResolvedValue(null);
    service.userRepo.findById.mockResolvedValue({ role: 'admin' });
    await expect(
      service.updateBlog(authorId, blogId, {}),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects a missing updater and deletes all dependent records for authorized users', async () => {
    const service = createService();
    service.blogRepo.findById.mockResolvedValue(draftBlog);
    service.userRepo.findById.mockResolvedValue(null);
    await expect(
      service.updateBlog(authorId, blogId, {}),
    ).rejects.toBeInstanceOf(NotFoundError);

    service.userRepo.findById.mockResolvedValue({ role: 'admin' });
    await service.deleteBlog(otherId, blogId);
    expect(service.likeRepo.deleteByBlog).toHaveBeenCalledWith(blogId);
    expect(service.commentRepo.deleteByBlog).toHaveBeenCalledWith(blogId);
    expect(service.blogRepo.delete).toHaveBeenCalledWith(blogId);

    service.userRepo.findById.mockResolvedValue({ role: 'user' });
    await expect(service.deleteBlog(otherId, blogId)).rejects.toBeInstanceOf(
      AuthorizationError,
    );
  });

  it('uses draft status when a new blog does not specify one', async () => {
    const service = createService();
    service.blogRepo.create.mockResolvedValue({});
    await service.createBlog(authorId, {
      title: 'Draft',
      content: 'plain',
      banner: { publicId: 'p' },
    });
    expect(service.blogRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft' }),
    );
  });

  it('lets administrators view all blogs and update allowed fields', async () => {
    const service = createService();

    service.userRepo.findById.mockResolvedValue({ role: 'admin' });
    service.blogRepo.count.mockResolvedValue(0);
    service.blogRepo.findAll.mockResolvedValue([]);
    service.blogRepo.findByUser.mockResolvedValue([]);
    await service.getAllBlogs(authorId, 1, 0);
    await service.getBlogsByUser(authorId, otherId, 1, 0);
    expect(service.blogRepo.findAll).toHaveBeenCalledWith({}, 1, 0);
    expect(service.blogRepo.findByUser).toHaveBeenCalledWith(otherId, {}, 1, 0);

    service.blogRepo.findById.mockResolvedValue(draftBlog);
    await service.updateBlog(otherId, blogId, {
      status: 'published',
      banner: { publicId: 'new-banner' },
    });
    expect(service.blogRepo.update).toHaveBeenCalledWith(blogId, {
      status: 'published',
      banner: { publicId: 'new-banner' },
    });
  });

  it('deletes an authorized blog even when it has no banner', async () => {
    const service = createService();
    service.userRepo.findById.mockResolvedValue({ role: 'admin' });
    service.blogRepo.findById.mockResolvedValue({ author: authorId });
    await service.deleteBlog(otherId, blogId);
  });
});
