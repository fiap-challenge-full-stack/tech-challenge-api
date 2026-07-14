import { Comentario } from './comentario';

export interface IComentarioRepository {
  create(comentario: Comentario): Promise<Comentario>;
  findById(uuid: string): Promise<Comentario | null>;
  findByPostUuid(postUuid: string): Promise<Comentario[]>;
  delete(uuid: string): Promise<void>;
}
