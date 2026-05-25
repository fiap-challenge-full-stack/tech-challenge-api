import request from 'supertest';
import app from '@/app';
import { db } from '@/lib/db';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth API - Integration Tests', () => {
  afterAll(async () => {
    await db.end();
    await prisma.$disconnect();
  });

  describe('POST /auth/registrar - Registro de Usuário', () => {
    const timestamp = Date.now();
    const testUser = {
      nome: 'Usuário Teste Integração',
      email: `teste-integracao-${timestamp}@test.com`,
      senha: 'Senha123@',
      papel: 'docente'
    };

    afterAll(async () => {
      await prisma.usuario.deleteMany({
        where: { email: { contains: 'teste-integracao' } }
      });
    });

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/registrar')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('usuario');
      expect(response.body.usuario).toHaveProperty('uuid');
      expect(response.body.usuario).toHaveProperty('email', testUser.email);
      expect(response.body.usuario).toHaveProperty('nome', testUser.nome);
      expect(response.body.usuario).toHaveProperty('papel', testUser.papel);
      expect(response.body.usuario).not.toHaveProperty('senha');
      expect(response.body.usuario).not.toHaveProperty('senhaHash');
      // Verificar se cookie foi setado
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];
      expect(cookiesArray.some((cookie: string) => cookie.includes('token='))).toBe(true);
    });

    it('should return 409 when trying to register with existing email', async () => {
      await request(app)
        .post('/auth/registrar')
        .send(testUser);

      const response = await request(app)
        .post('/auth/registrar')
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'Usuário já existe');
    });

    it('should return 400 when trying to register with weak password', async () => {
      const weakPasswordUser = {
        nome: 'Usuário Senha Fraca',
        email: `senha-fraca-${timestamp}@test.com`,
        senha: '123',
        papel: 'docente'
      };

      const response = await request(app)
        .post('/auth/registrar')
        .send(weakPasswordUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 when trying to register with invalid email', async () => {
      const invalidEmailUser = {
        nome: 'Usuário Email Inválido',
        email: 'email-invalido',
        senha: 'Senha123@',
        papel: 'docente'
      };

      const response = await request(app)
        .post('/auth/registrar')
        .send(invalidEmailUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /auth/login - Login de Usuário', () => {
    const loginTimestamp = Date.now();
    const existingUser = {
      nome: 'Usuário Login Teste',
      email: `login-teste-${loginTimestamp}@test.com`,
      senha: 'Senha123@',
      papel: 'docente'
    };

    beforeAll(async () => {
      await request(app)
        .post('/auth/registrar')
        .send(existingUser);
    });

    afterAll(async () => {
      await prisma.usuario.deleteMany({
        where: { email: { contains: 'login-teste' } }
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: existingUser.email,
          senha: existingUser.senha
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('usuario');
      expect(response.body.usuario).toHaveProperty('email', existingUser.email);
      expect(response.body.usuario).not.toHaveProperty('senha');
      // Verificar se cookie foi setado
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];
      expect(cookiesArray.some((cookie: string) => cookie.includes('token='))).toBe(true);
    });

    it('should return 401 when trying to login with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nao-existe@test.com',
          senha: 'Senha123@'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });

    it('should return 401 when trying to login with wrong password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: existingUser.email,
          senha: 'senha-errada'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Credenciais inválidas');
    });

    it('should return 400 when trying to login without email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          senha: existingUser.senha
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 when trying to login without password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: existingUser.email
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('Cookie-based Authentication', () => {
    const cookieTimestamp = Date.now();
    const testUser = {
      nome: 'Usuário Cookie Teste',
      email: `cookie-teste-${cookieTimestamp}@test.com`,
      senha: 'Senha123@',
      papel: 'admin'
    };

    afterAll(async () => {
      await prisma.usuario.deleteMany({
        where: { email: { contains: 'cookie-teste' } }
      });
    });

    it('should set HttpOnly cookie on registration', async () => {
      const response = await request(app)
        .post('/auth/registrar')
        .send(testUser);

      expect(response.status).toBe(201);
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];
      
      const tokenCookie = cookiesArray.find((cookie: string) => cookie.includes('token='));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toContain('HttpOnly');
      expect(tokenCookie).toContain('SameSite=Strict');
    });

    it('should set HttpOnly cookie on login', async () => {
      await request(app)
        .post('/auth/registrar')
        .send(testUser);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          senha: testUser.senha
        });

      expect(response.status).toBe(200);
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];
      
      const tokenCookie = cookiesArray.find((cookie: string) => cookie.includes('token='));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toContain('HttpOnly');
      expect(tokenCookie).toContain('SameSite=Strict');
    });
  });

  describe('Password Security', () => {
    const passwordTimestamp = Date.now();
    const testUser = {
      nome: 'Usuário Senha Teste',
      email: `senha-teste-${passwordTimestamp}@test.com`,
      senha: 'Senha123@',
      papel: 'docente'
    };

    afterAll(async () => {
      await prisma.usuario.deleteMany({
        where: { email: { contains: 'senha-teste' } }
      });
    });

    it('should store password as bcrypt hash', async () => {
      const response = await request(app)
        .post('/auth/registrar')
        .send(testUser);

      expect(response.status).toBe(201);

      const usuario = await prisma.usuario.findUnique({
        where: { email: testUser.email },
        select: { senha: true }
      });

      expect(usuario).toBeDefined();
      expect(usuario?.senha).toBeDefined();
      const storedPassword = usuario?.senha;
      
      expect(storedPassword).not.toBe(testUser.senha);
      expect(storedPassword?.length).toBe(60);
      expect(storedPassword).toMatch(/^\$2[ab]\$/);
    });

    it('should never return password in API responses', async () => {
      const responseTimestamp = Date.now();
      const uniqueEmail = `senha-response-${responseTimestamp}@test.com`;
      
      const registerResponse = await request(app)
        .post('/auth/registrar')
        .send({
          nome: testUser.nome,
          email: uniqueEmail,
          senha: testUser.senha,
          papel: testUser.papel
        });

      expect(registerResponse.body.usuario).not.toHaveProperty('senha');
      expect(registerResponse.body.usuario).not.toHaveProperty('senhaHash');

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: uniqueEmail,
          senha: testUser.senha
        });

      expect(loginResponse.body.usuario).not.toHaveProperty('senha');
      expect(loginResponse.body.usuario).not.toHaveProperty('senhaHash');

      // Limpar usuário extra criado neste teste
      await prisma.usuario.deleteMany({
        where: { email: { contains: 'senha-response' } }
      });
    });
  });
});
