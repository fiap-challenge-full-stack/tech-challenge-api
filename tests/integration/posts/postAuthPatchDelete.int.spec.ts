import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '@/app';
import { db } from '@/lib/db';

describe('Posts API - PATCH/DELETE Authenticated Integration', () => {
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
    testEmail = `patch-delete-${suffix}@test.com`;
    const password = 'senha123';

    const registerResponse = await request(app).post('/auth/registrar').send({
      email: testEmail,
      senha: password,
      nome: 'Patch Delete Tester',
      papel: 'admin',
    });
    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app).post('/auth/login').send({
      email: testEmail,
      senha: password,
    });
    expect(loginResponse.status).toBe(200);
    
    // Extrair token dos cookies
    const cookies = loginResponse.headers['set-cookie'];
    authToken = cookies ? extractTokenFromCookie(cookies) : '';
    expect(authToken).toBeTruthy();
  });

  afterAll(async () => {
    if (testEmail) {
      // Cleanup de usuário via SQL direto pois não há endpoint de delete usuário na API
      // Este SQL é necessário para limpar dados de teste após execução
      await db.query('DELETE FROM "usuarios" WHERE email = $1', [testEmail]);
    }
    await db.end();
  });

  it('updates with PATCH and persists after a new read', async () => {
    const createResponse = await request(app)
      .post('/posts')
      .set('Cookie', `token=${authToken}`)
      .send({
        title: 'Initial Title',
        content: 'Initial content long enough',
        author: 'Tester',
      });

    expect(createResponse.status).toBe(201);
    const postId = createResponse.body.uuid as string;

    const patchResponse = await request(app)
      .patch(`/posts/${postId}`)
      .set('Cookie', `token=${authToken}`)
      .send({ title: 'Updated Title' });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.title).toBe('Updated Title');

    const readAfterPatchResponse = await request(app).get(`/posts/${postId}`);

    expect(readAfterPatchResponse.status).toBe(200);
    expect(readAfterPatchResponse.body.title).toBe('Updated Title');

    // Cleanup via API em vez de SQL direto
    await request(app)
      .delete(`/posts/${postId}`)
      .set('Cookie', `token=${authToken}`);
  });

  it('deletes with DELETE and does not reappear on a new read', async () => {
    const createResponse = await request(app)
      .post('/posts')
      .set('Cookie', `token=${authToken}`)
      .send({
        title: 'Will be deleted',
        content: 'Content to be deleted and validated',
        author: 'Tester',
      });

    expect(createResponse.status).toBe(201);
    const postId = createResponse.body.uuid as string;

    const deleteResponse = await request(app)
      .delete(`/posts/${postId}`)
      .set('Cookie', `token=${authToken}`);

    expect(deleteResponse.status).toBe(204);

    const readAfterDeleteResponse = await request(app).get(`/posts/${postId}`);

    expect(readAfterDeleteResponse.status).toBe(404);
  });

  it('issues login token with about 1 hour expiration (test config)', async () => {
    const decoded = jwt.decode(authToken) as { exp?: number; iat?: number } | null;
    expect(decoded).not.toBeNull();
    expect(decoded?.exp).toBeDefined();
    expect(decoded?.iat).toBeDefined();

    const ttlInSeconds = (decoded?.exp as number) - (decoded?.iat as number);
    expect(ttlInSeconds).toBe(60 * 60); // 1 hora conforme .env.test
  });
});
