import request from 'supertest';
import app from '@/app';
import { db } from '@/lib/db';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth API Integration Tests', () => {
  const timestamp = Date.now();
  const testUser = {
    nome: 'User Integration Happy',
    email: `happy-path-${timestamp}@test.com`,
    senha: 'Senha123@',
    papel: 'docente'
  };

  afterAll(async () => {
    await prisma.usuario.deleteMany({
      where: { email: { contains: 'happy-path-' } }
    });
    await db.end();
    await prisma.$disconnect();
  });

  describe('Cenários Felizes (Happy Paths)', () => {
    it('deve registrar um usuário com sucesso e obter cookie de autenticação', async () => {
      const response = await request(app)
        .post('/auth/registrar')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('usuario');
      expect(response.body.usuario.email).toBe(testUser.email);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('deve efetuar login com sucesso e receber token no cookie', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          senha: testUser.senha
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('Validações (Validation Flows)', () => {
    it('deve retornar 400 ao registrar com email inválido', async () => {
      const response = await request(app)
        .post('/auth/registrar')
        .send({
          nome: 'Test',
          email: 'invalid-email',
          senha: 'Senha123@',
          papel: 'docente'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('deve retornar 400 ao registrar com senha fraca', async () => {
      const response = await request(app)
        .post('/auth/registrar')
        .send({
          nome: 'Test',
          email: `weak-pwd-${timestamp}@test.com`,
          senha: '123',
          papel: 'docente'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('Erros (Error Flows)', () => {
    it('deve retornar 409 ao registrar email já existente', async () => {
      const response = await request(app)
        .post('/auth/registrar')
        .send(testUser);

      expect(response.status).toBe(409);
    });

    it('deve retornar 401 para login com credenciais incorretas', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          senha: 'WrongPassword!'
        });

      expect(response.status).toBe(401);
    });
  });
});
