import request from 'supertest';
import app from '@/app';
import { db } from '@/lib/db';
import { criarTokenDeTeste, limparUsuariosDeTeste } from '@/tests/fixtures/auth';

describe('Posts API (Integration with Rollback)', () => {
  /**
   * Testes de integração que seguem boas práticas:
   * - Usam rotas da API para criar/manipular dados (caixa preta)
   * - SQL direto apenas para setup/cleanup quando necessário
   * - Testam a API como um todo, não o banco diretamente
   */
  
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
    it('should create a new post via API', async () => {
      const payload = {
        title: 'Integration Test Post',
        content: 'This is a test content',
        author: 'Test Author'
      };

      const response = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('uuid');
      expect(response.body.title).toBe(payload.title);

      // Cleanup via API (DELETE)
      await request(app)
        .delete(`/posts/${response.body.uuid}`)
        .set('Cookie', `token=${authToken}`);
    });
  });

  describe('GET /posts', () => {
    it('should list all posts', async () => {
      // Arrange: Criar um post temporário via API
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Temporary Post for List',
          content: 'Content content content with enough length',
          author: 'Author'
        });
      
      expect(createResponse.status).toBe(201);
      const postUuid = createResponse.body.uuid;

      // Act: Listar posts via API
      const response = await request(app).get('/posts');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((p: any) => p.uuid === postUuid)).toBe(true);

      // Cleanup via API
      await request(app)
        .delete(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return 404 for non-existent post', async () => {
      const response = await request(app).get('/posts/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Post não encontrado');
    });

    it('should return a post by id', async () => {
      // Arrange: Criar post via API
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Detail Test',
          content: 'Content content content with enough length',
          author: 'Author'
        });
      
      expect(createResponse.status).toBe(201);
      const postUuid = createResponse.body.uuid;

      // Act: Buscar post via API
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

  describe('GET /posts/search', () => {
    it('should return empty list when no posts match search query', async () => {
      const response = await request(app).get('/posts/search?q=XPTO_NON_EXISTENT_TERM');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should find posts by title or content', async () => {
      // Arrange: Criar post via API
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Searchable Title',
          content: 'Specific content keyword with enough length',
          author: 'Search Author'
        });
      
      expect(createResponse.status).toBe(201);
      const postUuid = createResponse.body.uuid;

      // Act: Buscar via API
      const response = await request(app).get('/posts/search?q=Searchable');
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.some((p: any) => p.uuid === postUuid)).toBe(true);

      // Cleanup via API
      await request(app)
        .delete(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`);
    });
  });

  describe('Flow Integration Test', () => {
    it('should complete a full cycle: create -> retrieve -> delete', async () => {
      // 1. Create via API
      const createRes = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({ title: 'Flow Test', content: 'Flow Flow Flow with enough length', author: 'Tester' });
      
      const postUuid = createRes.body.uuid;
      expect(createRes.status).toBe(201);

      // 2. Retrieve via API
      const getRes = await request(app).get(`/posts/${postUuid}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.title).toBe('Flow Test');

      // 3. Delete via API
      const deleteRes = await request(app)
        .delete(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`);
      expect(deleteRes.status).toBe(204);

      // 4. Verify deletion via API
      const finalRes = await request(app).get(`/posts/${postUuid}`);
      expect(finalRes.status).toBe(404);
    });
  });
});
