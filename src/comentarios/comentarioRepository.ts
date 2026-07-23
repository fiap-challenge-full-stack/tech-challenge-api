import { Comentario } from './comentario';

export interface IComentarioRepository {
  create(comentario: Comentario): Promise<Comentario>;
  findById(uuid: string): Promise<Comentario | null>;
  findByPostUuid(postUuid: string): Promise<Comentario[]>;
  update(uuid: string, conteudo: string): Promise<Comentario>;
  softDelete(uuid: string): Promise<Comentario>;
}
