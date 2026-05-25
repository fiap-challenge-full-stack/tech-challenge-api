import request from 'supertest';
import app from '@/app';
import { db } from '@/lib/db';
import { criarTokenDeTeste, limparUsuariosDeTeste } from '@/tests/fixtures/auth';

describe('Post Resource Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    const authFixture = await criarTokenDeTeste('docente');
    authToken = authFixture.token;
  });

  afterAll(async () => {
    await limparUsuariosDeTeste();
    await db.end();
  });

  describe('POST /posts', () => {
    describe('when data is valid (Happy Path)', () => {
      it('should create and return a new post', async () => {
        const payload = {
          title: 'A Valid Post Title',
          content: 'This is a valid post content with enough characters.',
          author: 'John Doe'
        };

        const response = await request(app)
          .post('/posts')
          .set('Cookie', `token=${authToken}`)
          .send(payload);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('uuid');
        
        // Cleanup via API em vez de SQL direto
        await request(app)
          .delete(`/posts/${response.body.uuid}`)
          .set('Cookie', `token=${authToken}`);
      });
    });

    describe('when data is invalid', () => {
      it('should return 400 when title is missing', async () => {
        const response = await request(app)
          .post('/posts')
          .set('Cookie', `token=${authToken}`)
          .send({ content: 'Content content content', author: 'Author' });

        expect(response.status).toBe(400);
      });
    });
  });

  describe('PATCH /posts/:id', () => {
    it('should update a post successfully', async () => {
      // Setup: Criar post via API
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Old Title',
          content: 'Old Content with enough length for validation',
          author: 'Author'
        });
      
      expect(createResponse.status).toBe(201);
      const postUuid = createResponse.body.uuid;

      const response = await request(app)
        .patch(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`)
        .send({ title: 'New Title' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('New Title');

      // Cleanup via API
      await request(app)
        .delete(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`);
    });

    it('should return 404 when updating non-existent post', async () => {
      const response = await request(app)
        .patch('/posts/00000000-0000-0000-0000-000000000000')
        .set('Cookie', `token=${authToken}`)
        .send({ title: 'New Title' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete a post successfully', async () => {
      // Setup: Criar post via API
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'To delete',
          content: 'Content content content with enough length',
          author: 'Author'
        });
      
      expect(createResponse.status).toBe(201);
      const postUuid = createResponse.body.uuid;

      const response = await request(app)
        .delete(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`);

      expect(response.status).toBe(204);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return 200 and the post when ID exists', async () => {
      // Setup: Criar post via API
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Exist',
          content: 'Content with enough length for validation',
          author: 'Author'
        });
      
      expect(createResponse.status).toBe(201);
      const postUuid = createResponse.body.uuid;

      const response = await request(app).get(`/posts/${postUuid}`);
      expect(response.status).toBe(200);
      expect(response.body.uuid).toBe(postUuid);

      // Cleanup via API
      await request(app)
        .delete(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`);
    });

    it('should return 404 when ID does not exist', async () => {
      const response = await request(app).get('/posts/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Post não encontrado');
    });
  });

  describe('GET /posts/search', () => {
    it('should return posts matching the query', async () => {
      // Setup: Criar post via API
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'KeywordMatch',
          content: 'Content with enough length for validation',
          author: 'Author'
        });
      
      expect(createResponse.status).toBe(201);
      const postUuid = createResponse.body.uuid;

      const response = await request(app).get('/posts/search?q=Keyword');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((p: any) => p.uuid === postUuid)).toBe(true);

      // Cleanup via API
      await request(app)
        .delete(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`);
    });
  });
});
