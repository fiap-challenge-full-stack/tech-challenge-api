import { Post } from './post';
import { IPostRepository } from './postRepository';
import { CreatePostInput, UpdatePostInput } from './postSchemas';

export class PostNotFoundError extends Error {
  constructor() {
    super('Post not found');
    this.name = 'PostNotFoundError';
  }
}

export class PostService {
  constructor(private readonly postRepository: IPostRepository) {}

  async create(data: CreatePostInput): Promise<Post> {
    const post = Post.create(data.title, data.content, data.author);
    return this.postRepository.create(post);
  }

  async listAll(): Promise<Post[]> {
    return this.postRepository.findAll();
  }

  async findById(id: string): Promise<Post | null> {
    return this.postRepository.findById(id);
  }

  async search(query: string): Promise<Post[]> {
    return this.postRepository.search(query);
  }

  async update(id: string, data: UpdatePostInput): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) throw new PostNotFoundError();
    
    post.update(data.title, data.content, data.author);
    return this.postRepository.update(post);
  }

  async delete(id: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) throw new PostNotFoundError();
    await this.postRepository.delete(id);
  }
}
