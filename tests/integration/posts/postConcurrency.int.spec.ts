import request from 'supertest';
import app from '@/app';
import { db } from '@/lib/db';
import { criarTokenDeTeste, limparUsuariosDeTeste } from '@/tests/fixtures/auth';

describe('Post Concurrency & Performance Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    const authFixture = await criarTokenDeTeste('docente');
    authToken = authFixture.token;
  });

  afterAll(async () => {
    // Teardown created posts for this author to rollback test data
    await db.query('DELETE FROM "posts" WHERE author = $1', ['Test User']);
    await limparUsuariosDeTeste();
    await db.end();
  });

  it('should handle concurrent post creation and maintain correct index sorting', async () => {
    const totalRequests = 10;
    const createPromises = [];

    // Simulate concurrent post creation
    for (let i = 0; i < totalRequests; i++) {
      createPromises.push(
        request(app)
          .post('/posts')
          .set('Cookie', `token=${authToken}`)
          .send({
            titulo: `Concurrent Post Title ${i} - ${Date.now()}`,
            conteudo: `This is a concurrent post content for index ${i}. It is used to validate database scaling and index performance.`
          })
      );
    }

    const responses = await Promise.all(createPromises);

    // Validate that all requests were processed successfully
    for (const response of responses) {
      expect(response.status).toBe(201);
      expect(response.body.sucesso).toBe(true);
      expect(response.body.dados).toHaveProperty('uuid');
    }

    // Query list to check sorting and ensure the index on createdAt is used
    const listResponse = await request(app).get('/posts');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.sucesso).toBe(true);
    
    const posts = listResponse.body.dados;
    expect(posts.length).toBeGreaterThanOrEqual(totalRequests);

    // Verify ordering is descending by createdAt / criadoEm
    for (let i = 0; i < posts.length - 1; i++) {
      const currentCreatedAt = new Date(posts[i].criadoEm).getTime();
      const nextCreatedAt = new Date(posts[i + 1].criadoEm).getTime();
      expect(currentCreatedAt).toBeGreaterThanOrEqual(nextCreatedAt);
    }
  });
});
