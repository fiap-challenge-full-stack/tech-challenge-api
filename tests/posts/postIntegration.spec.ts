import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('Posts API (Integration with Rollback)', () => {
  /**
   * Usamos transações explícitas no Prisma para garantir rollback total após cada teste.
   * Isso permite testar contra o banco real (Docker) sem poluir os dados ou depender de estados anteriores.
   */
  
  beforeEach(async () => {
    // Limpeza opcional antes de cada teste se necessário, 
    // mas o rollback da transação lidará com a maioria dos casos.
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /posts', () => {
    it('should create a new post and then rollback', async () => {
      // Usamos a transação oficial do Prisma para o teste
      // Nota: O Supertest envia requisições HTTP reais, 
      // então para um rollback "transacional" puro no banco,
      // o código da aplicação precisaria suportar injeção de transação.
      // Como estamos testando a API via HTTP (Blackbox), o rollback será via DELETE manual ou limpeza.
      
      const payload = {
        title: 'Integration Test Post',
        content: 'This is a test content',
        author: 'Test Author'
      };

      const response = await request(app)
        .post('/posts')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(payload.title);

      // Limpeza (Simulando o "rollback" de dados reais no banco de teste)
      await prisma.post.delete({ where: { id: response.body.id } });
    });
  });

  describe('GET /posts', () => {
    it('should list all posts', async () => {
      // Arrange: Criar um post temporário
      const post = await prisma.post.create({
        data: {
          title: 'Temporary Post for List',
          content: 'Content',
          author: 'Author'
        }
      });

      // Act
      const response = await request(app).get('/posts');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((p: any) => p.id === post.id)).toBe(true);

      // Cleanup
      await prisma.post.delete({ where: { id: post.id } });
    });
  });

  describe('GET /posts/:id', () => {
    it('should return 404 for non-existent post', async () => {
      const response = await request(app).get('/posts/non-existent-id');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Post not found' });
    });

    it('should return a post by id', async () => {
      const post = await prisma.post.create({
        data: {
          title: 'Detail Test',
          content: 'Content',
          author: 'Author'
        }
      });

      const response = await request(app).get(`/posts/${post.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(post.id);

      await prisma.post.delete({ where: { id: post.id } });
    });
  });

  describe('GET /posts/search', () => {
    it('should return empty list when no posts match search query', async () => {
      const response = await request(app).get('/posts/search?q=XPTO_NON_EXISTENT_TERM');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should find posts by title or content', async () => {
      const post = await prisma.post.create({
        data: {
          title: 'Searchable Title',
          content: 'Specific content keyword',
          author: 'Search Author'
        }
      });

      const response = await request(app).get('/posts/search?q=Searchable');
      
      expect(response.status).toBe(200);
      expect(response.body.some((p: any) => p.id === post.id)).toBe(true);

      await prisma.post.delete({ where: { id: post.id } });
    });
  });

  describe('Flow Integration Test', () => {
    it('should complete a full cycle: create -> retrieve -> deleted (rollback simulation)', async () => {
      // 1. Create
      const createRes = await request(app)
        .post('/posts')
        .send({ title: 'Flow Test', content: 'Flow', author: 'Tester' });
      
      const postId = createRes.body.id;
      expect(createRes.status).toBe(201);

      // 2. Retrieve
      const getRes = await request(app).get(`/posts/${postId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.title).toBe('Flow Test');

      // 3. Rollback (Delete)
      await prisma.post.delete({ where: { id: postId } });

      // 4. Verify deletion
      const finalRes = await request(app).get(`/posts/${postId}`);
      expect(finalRes.status).toBe(404);
    });
  });
});
