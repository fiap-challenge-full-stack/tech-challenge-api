import { db } from '@/lib/db';
import { PoolClient } from 'pg';

let testClient: PoolClient | null = null;
let originalQueryFn: typeof db.query | null = null;

export const dbTransactionHelper = {
  /**
   * Inicia uma transação e intercepta o pool de conexões do pg
   */
  async start() {
    // 1. Empresta um cliente dedicado do Pool
    testClient = await db.getClient();
    
    // 2. Inicia a transação
    await testClient.query('BEGIN');

    // 3. Salva a função de query original
    originalQueryFn = db.query;

    // 4. Sobrescreve temporariamente o db.query global para usar o cliente da transação
    db.query = (text: string, params?: unknown[]) => {
      if (!testClient) {
        throw new Error('Transaction client is not initialized');
      }
      return testClient.query(text, params);
    };
  },

  /**
   * Desfaz todas as alterações e restaura o comportamento original do Pool
   */
  async rollback() {
    try {
      if (testClient) {
        // 1. Desfaz a transação
        await testClient.query('ROLLBACK');
        // 2. Libera o cliente de volta para o Pool
        testClient.release();
      }
    } finally {
      testClient = null;
      // 3. Restaura a função original do banco
      if (originalQueryFn) {
        db.query = originalQueryFn;
        originalQueryFn = null;
      }
    }
  }
};
