import request from 'supertest';
import app from '@/app';
import { db } from '@/lib/db';
import { criarTokenDeTeste, limparUsuariosDeTeste } from '@/tests/fixtures/auth';
import { dbTransactionHelper } from '@/tests/helpers/dbTransactionHelper';

describe('Posts API Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    await dbTransactionHelper.start();
    const authFixture = await criarTokenDeTeste('docente');
    authToken = authFixture.token;
  });

  afterAll(async () => {
    await dbTransactionHelper.rollback();
    await limparUsuariosDeTeste();
    await db.end();
  });

  describe('Cenários Felizes (Happy Paths)', () => {
    let createdPostUuid: string;

    it('deve criar um post com sucesso se estiver autenticado', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Happy Path Post Title',
          content: 'This content has enough characters for validation rule.',
          author: 'Happy Author'
        });

      expect(response.status).toBe(201);
      const body = response.body.dados || response.body;
      expect(body).toHaveProperty('uuid');
      createdPostUuid = body.uuid;
    });

    it('deve listar posts cadastrados', async () => {
      const response = await request(app).get('/posts');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.dados)).toBe(true);
    });

    it('deve buscar post pelo uuid', async () => {
      const response = await request(app).get(`/posts/${createdPostUuid}`);
      expect(response.status).toBe(200);
      expect(response.body.dados.uuid).toBe(createdPostUuid);
    });

    it('deve buscar posts por texto', async () => {
      const response = await request(app).get('/posts/search?q=Happy');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.dados)).toBe(true);
    });

    it('deve deletar o post com sucesso', async () => {
      const response = await request(app)
        .delete(`/posts/${createdPostUuid}`)
        .set('Cookie', `token=${authToken}`);

      expect(response.status).toBe(204);
    });
  });

  describe('Validações (Validation Flows)', () => {
    it('deve retornar 400 ao criar post com título curto', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Ab',
          content: 'This content has enough characters for validation rule.',
          author: 'Author'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('deve retornar 400 ao criar post com conteúdo curto', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Valid Title Here',
          content: 'Short',
          author: 'Author'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('Erros (Error Flows)', () => {
    it('deve retornar 401 ao criar post sem autenticação', async () => {
      const response = await request(app)
        .post('/posts')
        .send({
          title: 'Unauthorized Post',
          content: 'Content that is valid but user is not logged in.',
          author: 'No One'
        });

      expect(response.status).toBe(401);
    });

    it('deve retornar 404 ao buscar post inexistente', async () => {
      const response = await request(app).get('/posts/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
    });
  });
});
