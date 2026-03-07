import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('Posts API - Failure Scenarios (Edge Cases)', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Retrieval Failures', () => {
    it('should return 404 when post does not exist', async () => {
      const response = await request(app).get('/posts/non-existent-uuid');
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Post not found' });
    });
  });

  describe('Search Failures', () => {
    it('should return empty list when no matches found', async () => {
      const response = await request(app).get('/posts/search?q=TERM_THAT_DOES_NOT_EXIST_123');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  // Nota: Testes de validação de campos (400 Bad Request) serão adicionados na Sprint 6
});
