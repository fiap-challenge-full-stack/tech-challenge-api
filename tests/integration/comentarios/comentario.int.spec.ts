import request from 'supertest';
import app from '@/app';
import { db } from '@/lib/db';
import { criarTokenDeTeste, limparUsuariosDeTeste } from '@/tests/fixtures/auth';

describe('Comentario Resource Integration Tests', () => {
  let autorToken: string;
  let outroToken: string;
  let adminToken: string;
  let postUuid: string;

  beforeAll(async () => {
    const autor = await criarTokenDeTeste('docente');
    autorToken = autor.token;
    const outro = await criarTokenDeTeste('aluno');
    outroToken = outro.token;
    const admin = await criarTokenDeTeste('admin');
    adminToken = admin.token;

    const createResponse = await request(app)
      .post('/posts')
      .set('Cookie', `token=${autorToken}`)
      .send({ titulo: 'Post para comentarios', conteudo: 'Conteudo de teste com tamanho suficiente.' });
    postUuid = createResponse.body.dados.uuid;
  });

  afterAll(async () => {
    await request(app).delete(`/posts/${postUuid}`).set('Cookie', `token=${autorToken}`);
    await limparUsuariosDeTeste();
    await db.end();
  });

  describe('POST /posts/:postUuid/comentarios (uso feliz)', () => {
    it('cria um comentario quando autenticado com dados validos', async () => {
      const response = await request(app)
        .post(`/posts/${postUuid}/comentarios`)
        .set('Cookie', `token=${outroToken}`)
        .send({ conteudo: 'Muito bom esse post!' });

      expect(response.status).toBe(201);
      expect(response.body.sucesso).toBe(true);
      expect(response.body.dados.conteudo).toBe('Muito bom esse post!');
      expect(response.body.dados.postUuid).toBe(postUuid);
    });
  });

  describe('POST /posts/:postUuid/comentarios (falha)', () => {
    it('retorna 401 sem token', async () => {
      const response = await request(app).post(`/posts/${postUuid}/comentarios`).send({ conteudo: 'Sem login' });
      expect(response.status).toBe(401);
    });

    it('retorna 404 quando o post nao existe', async () => {
      const response = await request(app)
        .post('/posts/00000000-0000-0000-0000-000000000000/comentarios')
        .set('Cookie', `token=${outroToken}`)
        .send({ conteudo: 'Comentario valido' });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /posts/:postUuid/comentarios (validacao)', () => {
    it('retorna 400 quando o conteudo e muito curto', async () => {
      const response = await request(app)
        .post(`/posts/${postUuid}/comentarios`)
        .set('Cookie', `token=${outroToken}`)
        .send({ conteudo: 'Oi' });

      expect(response.status).toBe(400);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('GET /posts/:postUuid/comentarios (uso feliz)', () => {
    it('lista os comentarios do post publicamente', async () => {
      const response = await request(app).get(`/posts/${postUuid}/comentarios`);

      expect(response.status).toBe(200);
      expect(response.body.sucesso).toBe(true);
      expect(Array.isArray(response.body.dados)).toBe(true);
      expect(response.body.dados.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /comentarios/:uuid', () => {
    it('permite que o autor exclua o proprio comentario (uso feliz)', async () => {
      const createResponse = await request(app)
        .post(`/posts/${postUuid}/comentarios`)
        .set('Cookie', `token=${outroToken}`)
        .send({ conteudo: 'Comentario para excluir' });
      const comentarioUuid = createResponse.body.dados.uuid;

      const response = await request(app).delete(`/comentarios/${comentarioUuid}`).set('Cookie', `token=${outroToken}`);

      expect(response.status).toBe(204);
    });

    it('permite que um admin exclua o comentario de outro usuario (uso feliz)', async () => {
      const createResponse = await request(app)
        .post(`/posts/${postUuid}/comentarios`)
        .set('Cookie', `token=${outroToken}`)
        .send({ conteudo: 'Comentario que o admin vai excluir' });
      const comentarioUuid = createResponse.body.dados.uuid;

      const response = await request(app).delete(`/comentarios/${comentarioUuid}`).set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(204);
    });

    it('retorna 403 quando outro usuario comum tenta excluir (falha)', async () => {
      const createResponse = await request(app)
        .post(`/posts/${postUuid}/comentarios`)
        .set('Cookie', `token=${outroToken}`)
        .send({ conteudo: 'Comentario protegido' });
      const comentarioUuid = createResponse.body.dados.uuid;

      const response = await request(app).delete(`/comentarios/${comentarioUuid}`).set('Cookie', `token=${autorToken}`);

      expect(response.status).toBe(403);

      await request(app).delete(`/comentarios/${comentarioUuid}`).set('Cookie', `token=${adminToken}`);
    });

    it('retorna 404 quando o comentario nao existe (falha)', async () => {
      const response = await request(app)
        .delete('/comentarios/00000000-0000-0000-0000-000000000000')
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('retorna 401 sem token (falha)', async () => {
      const response = await request(app).delete('/comentarios/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(401);
    });
  });
});
