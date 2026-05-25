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
    // Mapear campos em português para inglês
    const createData = {
      title: (data as any).titulo || data.title,
      content: (data as any).conteudo || data.content,
      author: (data as any).autor || data.author,
    };
    
    const post = Post.create(createData.title, createData.content, createData.author);
    return this.postRepository.create(post);
  }

  async listAll(): Promise<Post[]> {
    return this.postRepository.findAll();
  }

  async findByUuid(uuid: string): Promise<Post | null> {
    return this.postRepository.findById(uuid);
  }

  async search(query: string): Promise<Post[]> {
    return this.postRepository.search(query);
  }

  async update(uuid: string, data: UpdatePostInput): Promise<Post> {
    const post = await this.postRepository.findById(uuid);
    if (!post) throw new PostNotFoundError();
    
    // Mapear campos em português para inglês
    const updateData = {
      title: (data as any).titulo || data.title,
      content: (data as any).conteudo || data.content,
      author: (data as any).autor || data.author,
    };
    
    post.update(updateData.title, updateData.content, updateData.author);
    return this.postRepository.update(post);
  }

  async delete(uuid: string): Promise<void> {
    const post = await this.postRepository.findById(uuid);
    if (!post) throw new PostNotFoundError();
    await this.postRepository.delete(uuid);
  }
}
