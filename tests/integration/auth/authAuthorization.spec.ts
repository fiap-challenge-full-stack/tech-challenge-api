import request from 'supertest';
import app from '@/app';
import { db } from '@/lib/db';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth API - Authorization Tests', () => {
  const timestamp = Date.now();
  
  const docenteUser = {
    nome: 'Docente Autorização Teste',
    email: `docente-auth-${timestamp}@test.com`,
    senha: 'Senha123@',
    papel: 'docente'
  };

  const adminUser = {
    nome: 'Admin Autorização Teste',
    email: `admin-auth-${timestamp}@test.com`,
    senha: 'Senha123@',
    papel: 'admin'
  };

  const alunoUser = {
    nome: 'Aluno Autorização Teste',
    email: `aluno-auth-${timestamp}@test.com`,
    senha: 'Senha123@',
    papel: 'aluno'
  };

  let docenteToken = '';
  let adminToken = '';
  let alunoToken = '';

  beforeAll(async () => {
    // Registrar usuários e extrair tokens dos cookies
    const docenteResponse = await request(app)
      .post('/auth/registrar')
      .send(docenteUser);
    const docenteCookies = docenteResponse.headers['set-cookie'];
    docenteToken = docenteCookies ? extractTokenFromCookie(docenteCookies) : '';

    const adminResponse = await request(app)
      .post('/auth/registrar')
      .send(adminUser);
    const adminCookies = adminResponse.headers['set-cookie'];
    adminToken = adminCookies ? extractTokenFromCookie(adminCookies) : '';

    const alunoResponse = await request(app)
      .post('/auth/registrar')
      .send(alunoUser);
    const alunoCookies = alunoResponse.headers['set-cookie'];
    alunoToken = alunoCookies ? extractTokenFromCookie(alunoCookies) : '';
  });

  function extractTokenFromCookie(cookies: string | string[]): string {
    const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];
    const tokenCookie = cookiesArray.find((cookie: string) => cookie.includes('token='));
    if (!tokenCookie) return '';
    const match = tokenCookie.match(/token=([^;]+)/);
    return match ? match[1] : '';
  }

  afterAll(async () => {
    await prisma.usuario.deleteMany({
      where: { email: { contains: 'auth-' } }
    });
    await db.end();
    await prisma.$disconnect();
  });

  describe('POST /posts - Authorization by Role', () => {
    it('should allow docente to create post', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Cookie', `token=${docenteToken}`)
        .send({
          title: 'Post de Docente',
          content: 'Conteúdo do post de docente',
          author: 'Docente Teste'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('uuid');
      
      // Cleanup
      if (response.body.uuid) {
        await request(app)
          .delete(`/posts/${response.body.uuid}`)
          .set('Cookie', `token=${adminToken}`);
      }
    });

    it('should allow admin to create post', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Cookie', `token=${adminToken}`)
        .send({
          title: 'Post de Admin',
          content: 'Conteúdo do post de admin',
          author: 'Admin Teste'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('uuid');
      
      // Cleanup
      if (response.body.uuid) {
        await request(app)
          .delete(`/posts/${response.body.uuid}`)
          .set('Cookie', `token=${adminToken}`);
      }
    });

    it('should deny aluno to create post', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Cookie', `token=${alunoToken}`)
        .send({
          title: 'Post de Aluno',
          content: 'Conteúdo do post de aluno',
          author: 'Aluno Teste'
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Permissão insuficiente');
    });

    it('should deny unauthenticated user to create post', async () => {
      const response = await request(app)
        .post('/posts')
        .send({
          title: 'Post Não Autenticado',
          content: 'Conteúdo não autenticado',
          author: 'Anônimo'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token não fornecido');
    });
  });

  describe('PATCH /posts/:id - Authorization by Role', () => {
    let postUuid = '';

    beforeAll(async () => {
      // Criar um post para testar atualização
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${adminToken}`)
        .send({
          title: 'Post para Atualizar',
          content: 'Conteúdo original',
          author: 'Admin Teste'
        });
      postUuid = createResponse.body.uuid;
    });

    afterAll(async () => {
      if (postUuid) {
        // Cleanup via API em vez de SQL direto
        await request(app)
          .delete(`/posts/${postUuid}`)
          .set('Cookie', `token=${adminToken}`);
      }
    });

    it('should allow docente to update post', async () => {
      const response = await request(app)
        .patch(`/posts/${postUuid}`)
        .set('Cookie', `token=${docenteToken}`)
        .send({ title: 'Título Atualizado pelo Docente' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Título Atualizado pelo Docente');
    });

    it('should allow admin to update post', async () => {
      const response = await request(app)
        .patch(`/posts/${postUuid}`)
        .set('Cookie', `token=${adminToken}`)
        .send({ title: 'Título Atualizado pelo Admin' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Título Atualizado pelo Admin');
    });

    it('should deny aluno to update post', async () => {
      const response = await request(app)
        .patch(`/posts/${postUuid}`)
        .set('Cookie', `token=${alunoToken}`)
        .send({ title: 'Título Atualizado pelo Aluno' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Permissão insuficiente');
    });
  });

  describe('DELETE /posts/:id - Authorization by Role', () => {
    let postUuid = '';

    beforeAll(async () => {
      // Criar um post para testar exclusão
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${adminToken}`)
        .send({
          title: 'Post para Deletar',
          content: 'Conteúdo para deletar',
          author: 'Admin Teste'
        });
      postUuid = createResponse.body.uuid;
    });

    afterAll(async () => {
      // O post já deve ter sido deletado pelo teste, mas limpamos se necessário
      if (postUuid) {
        // Cleanup via API em vez de SQL direto
        await request(app)
          .delete(`/posts/${postUuid}`)
          .set('Cookie', `token=${adminToken}`);
      }
    });

    it('should allow docente to delete post', async () => {
      const response = await request(app)
        .delete(`/posts/${postUuid}`)
        .set('Cookie', `token=${docenteToken}`);

      expect(response.status).toBe(204);
      postUuid = ''; // Post deletado, não precisa limpar depois
    });

    it('should allow admin to delete post', async () => {
      // Criar novo post para teste de admin
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${adminToken}`)
        .send({
          title: 'Post para Admin Deletar',
          content: 'Conteúdo para admin deletar',
          author: 'Admin Teste'
        });
      const newPostUuid = createResponse.body.uuid;

      const response = await request(app)
        .delete(`/posts/${newPostUuid}`)
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(204);
    });

    it('should deny aluno to delete post', async () => {
      // Criar novo post para teste de aluno
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${adminToken}`)
        .send({
          title: 'Post que Aluno Não Pode Deletar',
          content: 'Conteúdo protegido',
          author: 'Admin Teste'
        });
      const protectedPostUuid = createResponse.body.uuid;

      const response = await request(app)
        .delete(`/posts/${protectedPostUuid}`)
        .set('Cookie', `token=${alunoToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Permissão insuficiente');

      // Cleanup via API em vez de SQL direto
      await request(app)
        .delete(`/posts/${protectedPostUuid}`)
        .set('Cookie', `token=${adminToken}`);
    });
  });

  describe('GET /posts - Public Access', () => {
    it('should allow unauthenticated user to list posts', async () => {
      const response = await request(app).get('/posts');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should allow authenticated user to list posts', async () => {
      const response = await request(app)
        .get('/posts')
        .set('Authorization', `Bearer ${docenteToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /posts/:id - Public Access', () => {
    let postUuid = '';

    beforeAll(async () => {
      const createResponse = await request(app)
        .post('/posts')
        .set('Cookie', `token=${adminToken}`)
        .send({
          title: 'Post Público',
          content: 'Conteúdo público',
          author: 'Admin Teste'
        });
      postUuid = createResponse.body.uuid;
    });

    afterAll(async () => {
      if (postUuid) {
        // Cleanup via API em vez de SQL direto
        await request(app)
          .delete(`/posts/${postUuid}`)
          .set('Cookie', `token=${adminToken}`);
      }
    });

    it('should allow unauthenticated user to view post', async () => {
      const response = await request(app).get(`/posts/${postUuid}`);

      expect(response.status).toBe(200);
      expect(response.body.uuid).toBe(postUuid);
    });

    it('should allow authenticated user to view post', async () => {
      const response = await request(app)
        .get(`/posts/${postUuid}`)
        .set('Cookie', `token=${alunoToken}`);

      expect(response.status).toBe(200);
      expect(response.body.uuid).toBe(postUuid);
    });
  });
});
