/**
 * Repositories
 */
import UserRepository from '@/repositories/v2/user.repository';
import TokenRepository from '@/repositories/v2/token.repository';
import LikeRepository from '@/repositories/v2/like.repository';
import CommentRepository from '@/repositories/v2/comment.repository';
import BlogRepository from '@/repositories/v2/blog.repository';

class ParentService {
  protected userRepo: UserRepository;
  protected tokenRepo: TokenRepository;
  protected blogRepo: BlogRepository;
  protected likeRepo: LikeRepository;
  protected commentRepo: CommentRepository;

  constructor() {
    this.userRepo = new UserRepository();
    this.tokenRepo = new TokenRepository();
    this.blogRepo = new BlogRepository();
    this.likeRepo = new LikeRepository();
    this.commentRepo = new CommentRepository();
  }
}

export default ParentService;
