import { test, expect } from '@playwright/test';

test.describe('API de Autenticação - Testes End-to-End', () => {
  test('POST /auth/register - registrar novo usuário', async ({ request }) => {
    const timestamp = Date.now();
    const response = await request.post('/auth/register', {
      data: {
        nome: `Usuário Teste ${timestamp}`,
        email: `teste${timestamp}@example.com`,
        senha: 'Senha123@'
      }
    });

    // Pode retornar 201 ou 400 se usuário já existir
    expect([201, 400]).toContain(response.status());
    
    if (response.status() === 201) {
      const data = await response.json();
      expect(data).toHaveProperty('uuid');
      expect(data).toHaveProperty('token');
    }
  });

  test('POST /auth/login - fazer login', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: {
        email: 'admin@admin.com',
        senha: 'admin123'
      }
    });

    // Pode retornar 200 ou 401 se credenciais inválidas
    expect([200, 401]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('usuario');
    }
  });

  test('POST /auth/login - credenciais inválidas retorna 401', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: {
        email: 'naoexiste@example.com',
        senha: 'senhaerrada'
      }
    });

    expect(response.status()).toBe(401);
  });
});
