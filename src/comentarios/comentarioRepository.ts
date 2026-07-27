import { Comentario } from './comentario';

export interface IComentarioPaginacao {
  page: number;
  pageSize: number;
}

export interface IComentariosPaginados {
  comentarios: Comentario[];
  total: number;
}

export interface IComentarioRepository {
  create(comentario: Comentario): Promise<Comentario>;
  findById(uuid: string): Promise<Comentario | null>;
  findByPostUuid(postUuid: string, paginacao: IComentarioPaginacao): Promise<IComentariosPaginados>;
  update(uuid: string, conteudo: string): Promise<Comentario>;
  softDelete(uuid: string): Promise<Comentario>;
}
