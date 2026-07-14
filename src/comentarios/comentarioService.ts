import { Comentario } from './comentario';
import { IComentarioRepository } from './comentarioRepository';
import { CreateComentarioInput } from './comentarioSchemas';
import { IPostRepository } from '../posts/postRepository';

export class ComentarioNotFoundError extends Error {
  constructor() {
    super('Comentario not found');
    this.name = 'ComentarioNotFoundError';
  }
}

export class PostDoComentarioNotFoundError extends Error {
  constructor() {
    super('Post not found');
    this.name = 'PostDoComentarioNotFoundError';
  }
}

export class ComentarioOperacaoNaoPermitidaError extends Error {
  constructor() {
    super('Operacao nao permitida para este usuario');
    this.name = 'ComentarioOperacaoNaoPermitidaError';
  }
}

interface IAutorSessao {
  uuid: string;
  nome: string;
  papel: string;
}

export class ComentarioService {
  constructor(
    private readonly comentarioRepository: IComentarioRepository,
    private readonly postRepository: IPostRepository,
  ) {}

  async create(postUuid: string, data: CreateComentarioInput, autor: IAutorSessao): Promise<Comentario> {
    const post = await this.postRepository.findById(postUuid);
    if (!post) throw new PostDoComentarioNotFoundError();

    const comentario = Comentario.create(postUuid, autor.uuid, autor.nome, data.conteudo);
    return this.comentarioRepository.create(comentario);
  }

  async listByPost(postUuid: string): Promise<Comentario[]> {
    const post = await this.postRepository.findById(postUuid);
    if (!post) throw new PostDoComentarioNotFoundError();

    return this.comentarioRepository.findByPostUuid(postUuid);
  }

  async delete(uuid: string, solicitante: IAutorSessao): Promise<void> {
    const comentario = await this.comentarioRepository.findById(uuid);
    if (!comentario) throw new ComentarioNotFoundError();

    const podeExcluir = comentario.autorUuid === solicitante.uuid || solicitante.papel === 'admin';
    if (!podeExcluir) throw new ComentarioOperacaoNaoPermitidaError();

    await this.comentarioRepository.delete(uuid);
  }
}
