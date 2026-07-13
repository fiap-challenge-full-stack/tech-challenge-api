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

  // `autor` é sempre derivado da sessão autenticada (API-06), nunca do corpo
  // da requisição — por isso é recebido como parâmetro explícito e separado.
  async create(data: CreatePostInput, autor: string): Promise<Post> {
    const post = Post.create(data.titulo, data.conteudo, autor);
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

    // A autoria de um post nunca é alterada via update — apenas título e conteúdo.
    post.update(data.titulo, data.conteudo);
    return this.postRepository.update(post);
  }

  async delete(uuid: string): Promise<void> {
    const post = await this.postRepository.findById(uuid);
    if (!post) throw new PostNotFoundError();
    await this.postRepository.delete(uuid);
  }
}
