import { Comentario } from './comentario';

export interface IComentarioPersistence {
  id: number | null;
  uuid: string | null;
  postUuid: string;
  autorUuid: string;
  autorNome: string;
  conteudo: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ComentarioMapper {
  static toDomain(raw: IComentarioPersistence): Comentario {
    return new Comentario(
      raw.id,
      raw.uuid,
      raw.postUuid,
      raw.autorUuid,
      raw.autorNome,
      raw.conteudo,
      new Date(raw.createdAt),
      new Date(raw.updatedAt),
    );
  }

  static toPersistence(comentario: Comentario): IComentarioPersistence {
    return {
      id: comentario.id,
      uuid: comentario.uuid,
      postUuid: comentario.postUuid,
      autorUuid: comentario.autorUuid,
      autorNome: comentario.autorNome,
      conteudo: comentario.conteudo,
      createdAt: comentario.createdAt,
      updatedAt: comentario.updatedAt,
    };
  }
}
