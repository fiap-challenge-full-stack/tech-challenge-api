import { db } from '../lib/db';
import { getTestUuids, clearTestSession } from './testModeMiddleware';

export class TestCleanupService {
  async cleanupTestSession(sessionId: string): Promise<{ deleted: { posts: number; usuarios: number } }> {
    const uuids = getTestUuids(sessionId);
    
    let deletedPosts = 0;
    let deletedUsuarios = 0;

    for (const uuid of uuids) {
      // Tentar deletar post
      try {
        const result = await db.query(
          'DELETE FROM "posts" WHERE uuid = $1 RETURNING id',
          [uuid]
        );
        if (result.rowCount && result.rowCount > 0) {
          deletedPosts++;
        }
      } catch (error) {
        // Ignorar erro se não for post
      }

      // Tentar deletar usuário
      try {
        const result = await db.query(
          'DELETE FROM "usuarios" WHERE uuid = $1 RETURNING id',
          [uuid]
        );
        if (result.rowCount && result.rowCount > 0) {
          deletedUsuarios++;
        }
      } catch (error) {
        // Ignorar erro se não for usuário
      }
    }

    // Limpar a sessão de teste
    clearTestSession(sessionId);

    return { deleted: { posts: deletedPosts, usuarios: deletedUsuarios } };
  }

  async cleanupAllTestSessions(): Promise<{ deleted: { posts: number; usuarios: number } }> {
    // Esta função pode ser exposta para limpeza administrativa
    // Por enquanto, retorna 0 pois precisamos de um mecanismo para acessar todas as sessões
    return { deleted: { posts: 0, usuarios: 0 } };
  }
}
