import { db } from '../lib/db';
import { Comentario } from './comentario';
import { IComentarioPaginacao, IComentarioRepository, IComentariosPaginados } from './comentarioRepository';
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

  async findByPostUuid(postUuid: string, { page, pageSize }: IComentarioPaginacao): Promise<IComentariosPaginados> {
    // Mais recentes primeiro: a primeira página é sempre o topo da conversa.
    const query = `
      SELECT *, COUNT(*) OVER() AS "totalRegistros"
      FROM "comentarios"
      WHERE "postUuid" = $1
      ORDER BY "createdAt" DESC, id DESC
      LIMIT $2 OFFSET $3;
    `;
    const { rows } = await db.query(query, [postUuid, pageSize, (page - 1) * pageSize]);
    const total = rows.length > 0 ? Number((rows[0] as { totalRegistros: string }).totalRegistros) : 0;
    return {
      comentarios: rows.map((row: IComentarioPersistence) => ComentarioMapper.toDomain(row)),
      total,
    };
  }

  async update(uuid: string, conteudo: string): Promise<Comentario> {
    const query = `
      UPDATE "comentarios"
      SET conteudo = $2, "updatedAt" = now()
      WHERE uuid = $1
      RETURNING *;
    `;
    const { rows } = await db.query(query, [uuid, conteudo]);
    return ComentarioMapper.toDomain(rows[0] as IComentarioPersistence);
  }

  async softDelete(uuid: string): Promise<Comentario> {
    const query = `
      UPDATE "comentarios"
      SET conteudo = '', apagado = true, "apagadoEm" = now(), "updatedAt" = now()
      WHERE uuid = $1
      RETURNING *;
    `;
    const { rows } = await db.query(query, [uuid]);
    return ComentarioMapper.toDomain(rows[0] as IComentarioPersistence);
  }
}
