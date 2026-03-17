import request from 'supertest';
import app from '../../src/app';
import { db } from '../../src/lib/db';

describe('Posts API - Failure Scenarios (Edge Cases)', () => {
  afterAll(async () => {
    await db.end();
  });

  describe('Retrieval Failures', () => {
    it('should return 404 when post does not exist', async () => {
      const response = await request(app).get('/posts/00000000-0000-0000-0000-000000000000');
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Post not found' });
    });
  });

  describe('Validation Failures (Zod)', () => {
    it('should return 400 when title is too short', async () => {
      const response = await request(app)
        .post('/posts')
        .send({ title: 'Ab', content: 'Content content content', author: 'Author' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 when content is too short', async () => {
      const response = await request(app)
        .post('/posts')
        .send({ title: 'Valid Title', content: 'Short', author: 'Author' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });
});
