import { db } from '../lib/db';
import { Comentario } from './comentario';
import { IComentarioRepository } from './comentarioRepository';
import { ComentarioMapper, IComentarioPersistence } from './comentarioMapper';

export class NativeSqlComentarioRepository implements IComentarioRepository {
  async create(comentario: Comentario): Promise<Comentario> {
    const raw = ComentarioMapper.toPersistence(comentario);
    const query = `
      INSERT INTO "comentarios" ("postUuid", "autorUuid", "autorNome", conteudo, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [raw.postUuid, raw.autorUuid, raw.autorNome, raw.conteudo, raw.createdAt, raw.updatedAt];
    const { rows } = await db.query(query, values);
    return ComentarioMapper.toDomain(rows[0] as IComentarioPersistence);
  }

  async findById(uuid: string): Promise<Comentario | null> {
    const query = 'SELECT * FROM "comentarios" WHERE uuid = $1;';
    const { rows } = await db.query(query, [uuid]);
    if (rows.length === 0) return null;
    return ComentarioMapper.toDomain(rows[0] as IComentarioPersistence);
  }

  async findByPostUuid(postUuid: string): Promise<Comentario[]> {
    const query = 'SELECT * FROM "comentarios" WHERE "postUuid" = $1 ORDER BY "createdAt" ASC;';
    const { rows } = await db.query(query, [postUuid]);
    return rows.map((row: IComentarioPersistence) => ComentarioMapper.toDomain(row));
  }

  async delete(uuid: string): Promise<void> {
    const query = 'DELETE FROM "comentarios" WHERE uuid = $1;';
    await db.query(query, [uuid]);
  }
}
