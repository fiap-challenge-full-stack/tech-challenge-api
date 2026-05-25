import request from 'supertest';
import app from '@/app';
import { db } from '@/lib/db';
import { criarTokenDeTeste, limparUsuariosDeTeste } from '@/tests/fixtures/auth';

describe('Posts API - Success Scenarios (Happy Path)', () => {
  let authToken: string;

  beforeAll(async () => {
    const authFixture = await criarTokenDeTeste('docente');
    authToken = authFixture.token;
  });

  afterAll(async () => {
    await limparUsuariosDeTeste();
    await db.end();
  });

  describe('Post Creation and Retrieval', () => {
    it('should create a new post successfully', async () => {
      const payload = {
        title: 'New Success Post',
        content: 'Content content content with enough length',
        author: 'Author'
      };

      const response = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(payload.title);

      // Cleanup via API em vez de SQL direto
      await request(app)
        .delete(`/posts/${response.body.uuid}`)
        .set('Cookie', `token=${authToken}`);
    });

    it('should list all posts', async () => {
      const response = await request(app).get('/posts');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return a post by id', async () => {
      // Arrange: Criar post via API
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Id Test',
          content: 'Content content content with enough length',
          author: 'Author'
        });
      
      expect(createResponse.status).toBe(201);
      const postUuid = createResponse.body.uuid;

      // Act: Buscar via API
      const response = await request(app).get(`/posts/${postUuid}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.uuid).toBe(postUuid);

      // Cleanup via API
      await request(app)
        .delete(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`);
    });
  });

  describe('Search Functionality', () => {
    it('should find posts by keyword', async () => {
      // Arrange: Criar post via API
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Searchable success',
          content: 'UniqueContent with enough length for validation',
          author: 'Author'
        });
      
      expect(createResponse.status).toBe(201);
      const postUuid = createResponse.body.uuid;

      // Act: Buscar via API
      const response = await request(app).get('/posts/search?q=UniqueContent');
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.some((p: any) => p.uuid === postUuid)).toBe(true);

      // Cleanup via API
      await request(app)
        .delete(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`);
    });
  });
});
