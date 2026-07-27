import { Comentario } from './comentario';
import { IComentarioRepository, IComentariosPaginados } from './comentarioRepository';
import { CreateComentarioInput, ListComentariosQuery, UpdateComentarioInput } from './comentarioSchemas';
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

  async listByPost(postUuid: string, query: ListComentariosQuery): Promise<IComentariosPaginados & ListComentariosQuery> {
    const post = await this.postRepository.findById(postUuid);
    if (!post) throw new PostDoComentarioNotFoundError();

    const { comentarios, total } = await this.comentarioRepository.findByPostUuid(postUuid, query);
    return { comentarios, total, page: query.page, pageSize: query.pageSize };
  }

  async update(uuid: string, data: UpdateComentarioInput, solicitante: IAutorSessao): Promise<Comentario> {
    const comentario = await this.comentarioRepository.findById(uuid);
    if (!comentario || comentario.apagado) throw new ComentarioNotFoundError();

    if (comentario.autorUuid !== solicitante.uuid) throw new ComentarioOperacaoNaoPermitidaError();

    return this.comentarioRepository.update(uuid, data.conteudo);
  }

  async delete(uuid: string, solicitante: IAutorSessao): Promise<void> {
    const comentario = await this.comentarioRepository.findById(uuid);
    if (!comentario || comentario.apagado) throw new ComentarioNotFoundError();

    const podeExcluir = comentario.autorUuid === solicitante.uuid || solicitante.papel === 'admin';
    if (!podeExcluir) throw new ComentarioOperacaoNaoPermitidaError();

    await this.comentarioRepository.softDelete(uuid);
  }
}
