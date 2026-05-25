import request from 'supertest';
import app from '@/app';
import { db } from '@/lib/db';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Posts API - Complete Update Integration Tests', () => {
  let authToken = '';
  let testEmail = '';

  function extractTokenFromCookie(cookies: string | string[]): string {
    const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];
    const tokenCookie = cookiesArray.find((cookie: string) => cookie.includes('token='));
    if (!tokenCookie) return '';
    const match = tokenCookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  }

  beforeAll(async () => {
    const suffix = Date.now();
    testEmail = `update-complete-${suffix}@test.com`;
    const password = 'senha123';

    const registerResponse = await request(app).post('/auth/registrar').send({
      email: testEmail,
      senha: password,
      nome: 'Update Complete Tester',
      papel: 'admin',
    });
    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app).post('/auth/login').send({
      email: testEmail,
      senha: password,
    });
    expect(loginResponse.status).toBe(200);
    
    const cookies = loginResponse.headers['set-cookie'];
    authToken = cookies ? extractTokenFromCookie(cookies) : '';
    expect(authToken).toBeTruthy();
  });

  afterAll(async () => {
    if (testEmail) {
      await prisma.usuario.deleteMany({
        where: { email: { contains: 'update-complete' } }
      });
    }
    await db.end();
    await prisma.$disconnect();
  });

  describe('PUT /posts/:id - Complete Update Tests', () => {
    let postUuid = '';

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Original Title',
          content: 'Original content for testing',
          author: 'Test Author'
        });
      postUuid = createResponse.body.uuid;
    });

    afterEach(async () => {
      if (postUuid) {
        // Cleanup via API em vez de SQL direto
        await request(app)
          .delete(`/posts/${postUuid}`)
          .set('Cookie', `token=${authToken}`);
        postUuid = '';
      }
    });

    it('should update title only', async () => {
      const response = await request(app)
        .patch(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`)
        .send({ title: 'Updated Title Only' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title Only');
      expect(response.body.content).toBe('Original content for testing');
    });

    it('should update content only', async () => {
      const response = await request(app)
        .patch(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`)
        .send({ content: 'Updated content only' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Original Title');
      expect(response.body.content).toBe('Updated content only');
    });

    it('should update author only', async () => {
      const response = await request(app)
        .patch(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`)
        .send({ author: 'Updated Author' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Original Title');
      expect(response.body.author).toBe('Updated Author');
    });

    it('should update all fields', async () => {
      const response = await request(app)
        .patch(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Completely Updated Title',
          content: 'Completely updated content',
          author: 'Completely Updated Author'
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Completely Updated Title');
      expect(response.body.content).toBe('Completely updated content');
      expect(response.body.author).toBe('Completely Updated Author');
    });

    it('should return 404 when updating non-existent post', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .patch(`/posts/${fakeUuid}`)
        .set('Cookie', `token=${authToken}`)
        .send({ title: 'Should not work' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Post não encontrado');
    });

    it('should return 401 when updating without authentication', async () => {
      const response = await request(app)
        .patch(`/posts/${postUuid}`)
        .send({ title: 'Should not work' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token não fornecido');
    });

    it('should return 403 when updating with insufficient permissions', async () => {
      // Criar usuário aluno
      const alunoEmail = `aluno-update-${Date.now()}@test.com`;
      await request(app).post('/auth/registrar').send({
        email: alunoEmail,
        senha: 'senha123',
        nome: 'Aluno Update',
        papel: 'aluno'
      });

      const alunoLogin = await request(app).post('/auth/login').send({
        email: alunoEmail,
        senha: 'senha123'
      });
      
      const alunoCookies = alunoLogin.headers['set-cookie'];
      const alunoToken = alunoCookies ? extractTokenFromCookie(alunoCookies) : '';

      const response = await request(app)
        .patch(`/posts/${postUuid}`)
        .set('Cookie', `token=${alunoToken}`)
        .send({ title: 'Should not work' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Permissão insuficiente');

      // Cleanup
      await prisma.usuario.deleteMany({ where: { email: alunoEmail } });
    });
  });

  describe('DELETE /posts/:id - Complete Delete Tests', () => {
    let postUuid = '';

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${authToken}`)
        .send({
          title: 'Post to Delete',
          content: 'Content to be deleted',
          author: 'Delete Author'
        });
      postUuid = createResponse.body.uuid;
    });

    afterEach(async () => {
      if (postUuid) {
        // Cleanup via API em vez de SQL direto
        await request(app)
          .delete(`/posts/${postUuid}`)
          .set('Cookie', `token=${authToken}`);
        postUuid = '';
      }
    });

    it('should delete post successfully', async () => {
      const response = await request(app)
        .delete(`/posts/${postUuid}`)
        .set('Cookie', `token=${authToken}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      // Verificar que foi realmente deletado
      const getResponse = await request(app).get(`/posts/${postUuid}`);
      expect(getResponse.status).toBe(404);
      
      postUuid = ''; // Já foi deletado
    });

    it('should return 404 when deleting non-existent post', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/posts/${fakeUuid}`)
        .set('Cookie', `token=${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Post não encontrado');
    });

    it('should return 401 when deleting without authentication', async () => {
      const response = await request(app)
        .delete(`/posts/${postUuid}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token não fornecido');
    });

    it('should return 403 when deleting with insufficient permissions', async () => {
      // Criar usuário aluno
      const alunoEmail = `aluno-delete-${Date.now()}@test.com`;
      await request(app).post('/auth/registrar').send({
        email: alunoEmail,
        senha: 'senha123',
        nome: 'Aluno Delete',
        papel: 'aluno'
      });

      const alunoLogin = await request(app).post('/auth/login').send({
        email: alunoEmail,
        senha: 'senha123'
      });
      
      const alunoCookies = alunoLogin.headers['set-cookie'];
      const alunoToken = alunoCookies ? extractTokenFromCookie(alunoCookies) : '';

      const response = await request(app)
        .delete(`/posts/${postUuid}`)
        .set('Cookie', `token=${alunoToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Permissão insuficiente');

      // Cleanup
      await prisma.usuario.deleteMany({ where: { email: alunoEmail } });
    });
  });
});
