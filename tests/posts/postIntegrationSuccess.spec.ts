import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('Posts API - Success Scenarios (Happy Path)', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Post Creation and Retrieval', () => {
    it('should create a new post successfully', async () => {
      const payload = {
        title: 'BDD Success Post',
        content: 'Content for success',
        author: 'Success Author'
      };

      const response = await request(app).post('/posts').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(payload.title);

      await prisma.post.delete({ where: { id: response.body.id } });
    });

    it('should list all posts', async () => {
      const response = await request(app).get('/posts');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return a post by id', async () => {
      const post = await prisma.post.create({
        data: { title: 'Id Test', content: 'Content', author: 'Author' }
      });

      const response = await request(app).get(`/posts/${post.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(post.id);

      await prisma.post.delete({ where: { id: post.id } });
    });
  });

  describe('Search Functionality', () => {
    it('should find posts by keyword', async () => {
      const post = await prisma.post.create({
        data: { title: 'Searchable success', content: 'UniqueContent', author: 'Author' }
      });

      const response = await request(app).get('/posts/search?q=UniqueContent');
      
      expect(response.status).toBe(200);
      expect(response.body.some((p: any) => p.id === post.id)).toBe(true);

      await prisma.post.delete({ where: { id: post.id } });
    });
  });
});
