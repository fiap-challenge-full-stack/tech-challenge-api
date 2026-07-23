import request from 'supertest';
import app from '@/app';
import { db } from '@/lib/db';
import { criarTokenDeTeste, limparUsuariosDeTeste } from '@/tests/fixtures/auth';
import { dbTransactionHelper } from '@/tests/helpers/dbTransactionHelper';

describe('Comentarios API Integration Tests', () => {
  let autorToken: string;
  let alunoToken: string;
  let postUuid: string;

  beforeAll(async () => {
    await dbTransactionHelper.start();
    const autor = await criarTokenDeTeste('docente');
    autorToken = autor.token;
    const aluno = await criarTokenDeTeste('aluno');
    alunoToken = aluno.token;

    // Criar um post para associar comentários
    const createResponse = await request(app)
      .post('/posts')
      .set('Cookie', `token=${autorToken}`)
      .send({ title: 'Post para comentarios', content: 'Conteudo de teste com tamanho suficiente.' });
    
    // Suportar tanto retorno direto quanto envelopado em dados
    postUuid = createResponse.body.uuid || (createResponse.body.dados && createResponse.body.dados.uuid);
  });

  afterAll(async () => {
    await dbTransactionHelper.rollback();
    if (postUuid) {
      await request(app)
        .delete(`/posts/${postUuid}`)
        .set('Cookie', `token=${autorToken}`);
    }
    await limparUsuariosDeTeste();
    await db.end();
  });

  describe('Cenários Felizes (Happy Paths)', () => {
    let createdCommentUuid: string;

    it('deve adicionar um comentário com sucesso', async () => {
      const response = await request(app)
        .post(`/posts/${postUuid}/comentarios`)
        .set('Cookie', `token=${alunoToken}`)
        .send({ conteudo: 'Muito bom esse post!' });

      expect(response.status).toBe(201);
      // Suportar envelopado e não envelopado
      const body = response.body.dados || response.body;
      expect(body.conteudo).toBe('Muito bom esse post!');
      createdCommentUuid = body.uuid;
    });

    it('deve listar os comentários de um post', async () => {
      const response = await request(app).get(`/posts/${postUuid}/comentarios`);
      expect(response.status).toBe(200);
      const data = response.body.dados || response.body;
      expect(Array.isArray(data)).toBe(true);
    });

    it('deve permitir que o autor edite seu próprio comentário', async () => {
      const response = await request(app)
        .patch(`/comentarios/${createdCommentUuid}`)
        .set('Cookie', `token=${alunoToken}`)
        .send({ conteudo: 'Muito bom esse post! (editado)' });

      expect(response.status).toBe(200);
      const body = response.body.dados || response.body;
      expect(body.conteudo).toBe('Muito bom esse post! (editado)');
      expect(body.editado).toBe(true);
    });

    it('não deve permitir que outro usuário edite um comentário alheio', async () => {
      const response = await request(app)
        .patch(`/comentarios/${createdCommentUuid}`)
        .set('Cookie', `token=${autorToken}`)
        .send({ conteudo: 'Tentativa de edição indevida.' });

      expect(response.status).toBe(403);
    });

    it('não deve permitir que outro usuário exclua um comentário alheio', async () => {
      const response = await request(app)
        .delete(`/comentarios/${createdCommentUuid}`)
        .set('Cookie', `token=${autorToken}`);

      expect(response.status).toBe(403);
    });

    it('deve permitir que o autor remova (logicamente) seu próprio comentário', async () => {
      const response = await request(app)
        .delete(`/comentarios/${createdCommentUuid}`)
        .set('Cookie', `token=${alunoToken}`);

      expect(response.status).toBe(204);

      const listResponse = await request(app).get(`/posts/${postUuid}/comentarios`);
      const comentarios = listResponse.body.dados || listResponse.body;
      const comentarioApagado = comentarios.find((c: { uuid: string }) => c.uuid === createdCommentUuid);

      expect(comentarioApagado).toBeDefined();
      expect(comentarioApagado.apagado).toBe(true);
      expect(comentarioApagado.conteudo).toBe('');
    });

    it('não deve permitir editar um comentário já apagado', async () => {
      const response = await request(app)
        .patch(`/comentarios/${createdCommentUuid}`)
        .set('Cookie', `token=${alunoToken}`)
        .send({ conteudo: 'Tentando reviver o comentário.' });

      expect(response.status).toBe(404);
    });
  });

  describe('Validações (Validation Flows)', () => {
    it('deve retornar 400 ao comentar com conteúdo muito curto', async () => {
      const response = await request(app)
        .post(`/posts/${postUuid}/comentarios`)
        .set('Cookie', `token=${alunoToken}`)
        .send({ conteudo: 'Oi' });

      expect(response.status).toBe(400);
    });
  });

  describe('Erros (Error Flows)', () => {
    it('deve retornar 401 ao comentar sem autenticação', async () => {
      const response = await request(app)
        .post(`/posts/${postUuid}/comentarios`)
        .send({ conteudo: 'Comentário sem estar autenticado.' });

      expect(response.status).toBe(401);
    });

    it('deve retornar 404 ao comentar em post inexistente', async () => {
      const response = await request(app)
        .post('/posts/00000000-0000-0000-0000-000000000000/comentarios')
        .set('Cookie', `token=${alunoToken}`)
        .send({ conteudo: 'Comentário em post fantasma.' });

      expect(response.status).toBe(404);
    });
  });
});
