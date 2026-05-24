import { test, expect } from '@playwright/test';

test.describe('API de Posts - Testes End-to-End', () => {
  test('GET /posts - listar todos os posts', async ({ request }) => {
    const response = await request.get('/posts');
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('GET /posts/:id - buscar post por UUID', async ({ request }) => {
    // Primeiro criar um post temporário
    const createResponse = await request.post('/posts', {
      data: {
        title: 'Post de Teste E2E',
        content: 'Conteúdo do post de teste end-to-end',
        author: 'Testador E2E'
      }
    });

    // Se criar falhar devido a autenticação, vamos buscar um existente
    if (createResponse.status() === 401) {
      const listResponse = await request.get('/posts');
      const posts = await listResponse.json();
      
      if (posts.length > 0) {
        const postUuid = posts[0].uuid;
        const getResponse = await request.get(`/posts/${postUuid}`);
        
        expect(getResponse.status()).toBe(200);
        const postData = await getResponse.json();
        expect(postData).toHaveProperty('uuid');
        expect(postData).toHaveProperty('title');
      }
    } else if (createResponse.status() === 201) {
      const postData = await createResponse.json();
      const postUuid = postData.uuid;
      
      const getResponse = await request.get(`/posts/${postUuid}`);
      expect(getResponse.status()).toBe(200);
      
      const retrievedData = await getResponse.json();
      expect(retrievedData.uuid).toBe(postUuid);
      expect(retrievedData.title).toBe('Post de Teste E2E');
    }
  });

  test('GET /posts/search - buscar posts por termo', async ({ request }) => {
    const response = await request.get('/posts/search?q=test');
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('GET /posts/:id - post não existente retorna 404', async ({ request }) => {
    const response = await request.get('/posts/00000000-0000-0000-0000-000000000000');
    
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data).toHaveProperty('message');
  });

  test('POST /posts - criar novo post (se autenticado)', async ({ request }) => {
    const response = await request.post('/posts', {
      data: {
        title: 'Novo Post E2E',
        content: 'Conteúdo do novo post criado via teste E2E',
        author: 'Autor E2E'
      }
    });

    // Pode retornar 401 se não estiver autenticado
    expect([201, 401]).toContain(response.status());
    
    if (response.status() === 201) {
      const data = await response.json();
      expect(data).toHaveProperty('uuid');
      expect(data.title).toBe('Novo Post E2E');
    }
  });
});
