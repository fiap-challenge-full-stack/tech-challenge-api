import request from 'supertest';
import app from '../../src/app';
import { db } from '../../src/lib/db';

describe('Posts API - Success Scenarios (Happy Path)', () => {
  afterAll(async () => {
    await db.end();
  });

  describe('Post Creation and Retrieval', () => {
    it('should create a new post successfully', async () => {
      const payload = {
        title: 'New Success Post',
        content: 'Content content content with enough length',
        author: 'Author'
      };

      const response = await request(app)
        .post('/posts')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(payload.title);

      await db.query('DELETE FROM "posts" WHERE uuid = $1', [response.body.uuid]);
    });

    it('should list all posts', async () => {
      const response = await request(app).get('/posts');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return a post by id', async () => {
      const res = await db.query('INSERT INTO "posts" (title, content, author) VALUES ($1, $2, $3) RETURNING *', ['Id Test', 'Content content content', 'Author']);
      const post = res.rows[0];

      const response = await request(app).get(`/posts/${post.uuid}`);

      expect(response.status).toBe(200);
      expect(response.body.uuid).toBe(post.uuid);

      await db.query('DELETE FROM "posts" WHERE uuid = $1', [post.uuid]);
    });
  });

  describe('Search Functionality', () => {
    it('should find posts by keyword', async () => {
      const res = await db.query('INSERT INTO "posts" (title, content, author) VALUES ($1, $2, $3) RETURNING *', ['Searchable success', 'UniqueContent', 'Author']);
      const post = res.rows[0];

      const response = await request(app).get('/posts/search?q=UniqueContent');
      
      expect(response.status).toBe(200);
      expect(response.body.some((p: any) => p.uuid === post.uuid)).toBe(true);

      await db.query('DELETE FROM "posts" WHERE uuid = $1', [post.uuid]);
    });
  });
});
