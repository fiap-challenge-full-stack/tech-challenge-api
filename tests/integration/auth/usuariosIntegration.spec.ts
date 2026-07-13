import request from 'supertest';
import app from '@/app';
import { db } from '@/lib/db';
import { PrismaClient } from '@prisma/client';
import { criarTokenDeTeste } from '@/tests/fixtures/auth';

const prisma = new PrismaClient();

describe('Usuarios API - Integration Tests', () => {
  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { email: { contains: 'usuarios-int-' } } });
    await db.end();
    await prisma.$disconnect();
  });

  describe('POST /auth/registrar - anti escalação de privilégio (API-02)', () => {
    it('deve ignorar papel enviado pelo cliente e sempre registrar como docente', async () => {
      const timestamp = Date.now();
      const email = `usuarios-int-escalada-${timestamp}@test.com`;

      const response = await request(app)
        .post('/auth/registrar')
        .send({
          nome: 'Tentativa de Escalada',
          email,
          senha: 'Senha123@',
          papel: 'admin',
        });

      expect(response.status).toBe(201);
      expect(response.body.usuario.papel).toBe('docente');

      await prisma.usuario.deleteMany({ where: { email } });
    });
  });

  describe('GET /usuarios - protegido por admin (API-03)', () => {
    it('deve negar acesso para usuário não autenticado', async () => {
      const response = await request(app).get('/usuarios');
      expect(response.status).toBe(401);
    });

    it('deve negar acesso para usuário não-admin', async () => {
      const { token } = await criarTokenDeTeste('docente');

      const response = await request(app)
        .get('/usuarios')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(403);
    });

    it('deve listar usuários paginados para admin, com filtro por papel', async () => {
      const { token } = await criarTokenDeTeste('admin');

      const response = await request(app)
        .get('/usuarios?page=1&pageSize=5&papel=admin')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.sucesso).toBe(true);
      expect(Array.isArray(response.body.dados)).toBe(true);
      expect(response.body.paginacao).toEqual(
        expect.objectContaining({ page: 1, pageSize: 5 })
      );
      response.body.dados.forEach((usuario: { papel: string; senha?: string }) => {
        expect(usuario.papel).toBe('admin');
        expect(usuario).not.toHaveProperty('senha');
      });
    });
  });

  describe('POST /usuarios - criação administrativa (API-04)', () => {
    it('deve permitir que admin crie usuário com papel específico', async () => {
      const { token } = await criarTokenDeTeste('admin');
      const email = `usuarios-int-criado-${Date.now()}@test.com`;

      const response = await request(app)
        .post('/usuarios')
        .set('Cookie', `token=${token}`)
        .send({ nome: 'Criado Por Admin', email, senha: 'Senha123@', papel: 'aluno' });

      expect(response.status).toBe(201);
      expect(response.body.dados.papel).toBe('aluno');
      expect(response.body.dados).not.toHaveProperty('senha');
    });

    it('deve retornar 409 ao criar usuário com email duplicado', async () => {
      const { token } = await criarTokenDeTeste('admin');
      const email = `usuarios-int-duplicado-${Date.now()}@test.com`;

      await request(app)
        .post('/usuarios')
        .set('Cookie', `token=${token}`)
        .send({ nome: 'Original', email, senha: 'Senha123@', papel: 'docente' });

      const response = await request(app)
        .post('/usuarios')
        .set('Cookie', `token=${token}`)
        .send({ nome: 'Duplicado', email, senha: 'Senha123@', papel: 'docente' });

      expect(response.status).toBe(409);
    });

    it('deve rejeitar senha fraca', async () => {
      const { token } = await criarTokenDeTeste('admin');

      const response = await request(app)
        .post('/usuarios')
        .set('Cookie', `token=${token}`)
        .send({
          nome: 'Senha Fraca',
          email: `usuarios-int-fraca-${Date.now()}@test.com`,
          senha: 'abc12345',
          papel: 'docente',
        });

      expect(response.status).toBe(400);
    });

    it('deve negar criação por não-admin', async () => {
      const { token } = await criarTokenDeTeste('docente');

      const response = await request(app)
        .post('/usuarios')
        .set('Cookie', `token=${token}`)
        .send({
          nome: 'Não Deveria Criar',
          email: `usuarios-int-negado-${Date.now()}@test.com`,
          senha: 'Senha123@',
          papel: 'admin',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET/PUT/DELETE /usuarios/:uuid - self-service e admin', () => {
    it('deve permitir que o próprio usuário consulte e atualize seus dados', async () => {
      const { token, usuario } = await criarTokenDeTeste('docente');

      const getResponse = await request(app)
        .get(`/usuarios/${usuario.uuid}`)
        .set('Cookie', `token=${token}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.dados.uuid).toBe(usuario.uuid);

      const updateResponse = await request(app)
        .patch(`/usuarios/${usuario.uuid}`)
        .set('Cookie', `token=${token}`)
        .send({ nome: 'Nome Atualizado' });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.dados.nome).toBe('Nome Atualizado');
    });

    it('deve ignorar tentativa de auto-promoção via PATCH por não-admin', async () => {
      const { token, usuario } = await criarTokenDeTeste('docente');

      const response = await request(app)
        .patch(`/usuarios/${usuario.uuid}`)
        .set('Cookie', `token=${token}`)
        .send({ papel: 'admin' });

      expect(response.status).toBe(200);
      expect(response.body.dados.papel).toBe('docente');
    });

    it('deve negar consulta/atualização de outro usuário por não-admin', async () => {
      const { token } = await criarTokenDeTeste('docente');
      const outro = await criarTokenDeTeste('docente');

      const getResponse = await request(app)
        .get(`/usuarios/${outro.usuario.uuid}`)
        .set('Cookie', `token=${token}`);
      expect(getResponse.status).toBe(403);

      const patchResponse = await request(app)
        .patch(`/usuarios/${outro.usuario.uuid}`)
        .set('Cookie', `token=${token}`)
        .send({ nome: 'Hackeado' });
      expect(patchResponse.status).toBe(403);
    });

    it('deve retornar 404 ao buscar usuário inexistente como admin', async () => {
      const { token } = await criarTokenDeTeste('admin');

      const response = await request(app)
        .get('/usuarios/00000000-0000-4000-8000-000000000000')
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(404);
    });

    it('deve permitir autodeleção da própria conta', async () => {
      const { token, usuario } = await criarTokenDeTeste('docente');

      const response = await request(app)
        .delete(`/usuarios/${usuario.uuid}`)
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(204);

      const confirmacao = await prisma.usuario.findUnique({ where: { uuid: usuario.uuid } });
      expect(confirmacao).toBeNull();
    });

    it('deve negar remoção de outro usuário por não-admin', async () => {
      const { token } = await criarTokenDeTeste('docente');
      const outro = await criarTokenDeTeste('docente');

      const response = await request(app)
        .delete(`/usuarios/${outro.usuario.uuid}`)
        .set('Cookie', `token=${token}`);

      expect(response.status).toBe(403);

      await prisma.usuario.deleteMany({ where: { uuid: outro.usuario.uuid } });
    });
  });
});
