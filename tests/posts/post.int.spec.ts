import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('Post Resource Integration Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /posts', () => {
    describe('when data is valid (Happy Path)', () => {
      it('should create and return a new post', async () => {
        const payload = {
          title: 'Market Standard Test',
          content: 'This is a valid content with more than 10 characters',
          author: 'Author Name'
        };
        const response = await request(app).post('/posts').send(payload);
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        
        await prisma.post.delete({ where: { id: response.body.id } });
      });
    });

    describe('when data is invalid (Edge Cases - Sprint 6)', () => {
      it('should return 400 when title is missing', async () => {
        const payload = {
          content: 'This is a valid content with more than 10 characters',
          author: 'Author Name'
        };
        const response = await request(app).post('/posts').send(payload);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Falha na validação dos campos');
      });

      it('should return 400 when content is too short', async () => {
        const payload = {
          title: 'Valid Title',
          content: 'short',
          author: 'Author Name'
        };
        const response = await request(app).post('/posts').send(payload);
        
        expect(response.status).toBe(400);
      });
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update a post successfully', async () => {
      const post = await prisma.post.create({
        data: { title: 'Old Title', content: 'Old Content with length', author: 'Author' }
      });

      const response = await request(app)
        .put(`/posts/${post.id}`)
        .send({ title: 'New Title' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('New Title');

      await prisma.post.delete({ where: { id: post.id } });
    });

    it('should return 404 when updating non-existent post', async () => {
      const response = await request(app)
        .put('/posts/non-existent-id')
        .send({ title: 'New Title' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete a post successfully', async () => {
      const post = await prisma.post.create({
        data: { title: 'To delete', content: 'Content content content', author: 'Author' }
      });

      const response = await request(app).delete(`/posts/${post.id}`);

      expect(response.status).toBe(204);

      const check = await prisma.post.findUnique({ where: { id: post.id } });
      expect(check).toBeNull();
    });
  });

  describe('GET /posts', () => {
    it('should return a list of posts', async () => {
      const response = await request(app).get('/posts');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return 200 and the post when ID exists', async () => {
      const post = await prisma.post.create({
        data: { title: 'Exist', content: 'C', author: 'A' }
      });
      const response = await request(app).get(`/posts/${post.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(post.id);
      
      await prisma.post.delete({ where: { id: post.id } });
    });

    it('should return 404 when ID does not exist', async () => {
      const response = await request(app).get('/posts/non-existent-id');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Post not found');
    });
  });

  describe('GET /posts/search', () => {
    it('should return posts matching the query', async () => {
      const post = await prisma.post.create({
        data: { title: 'KeywordMatch', content: 'C', author: 'A' }
      });
      const response = await request(app).get('/posts/search?q=Keyword');
      
      expect(response.status).toBe(200);
      expect(response.body.some((p: any) => p.id === post.id)).toBe(true);
      
      await prisma.post.delete({ where: { id: post.id } });
    });

    it('should return empty list when no match is found', async () => {
      const response = await request(app).get('/posts/search?q=NOTHING_FOUND');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});
