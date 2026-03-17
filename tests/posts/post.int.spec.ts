import request from 'supertest';
import app from '../../src/app';
import { db } from '../../src/lib/db';

describe('Post Resource Integration Tests', () => {
  afterAll(async () => {
    await db.end();
  });

  describe('POST /posts', () => {
    describe('when data is valid (Happy Path)', () => {
      it('should create and return a new post', async () => {
        const payload = {
          title: 'A Valid Post Title',
          content: 'This is a valid post content with enough characters.',
          author: 'John Doe'
        };

        const response = await request(app)
          .post('/posts')
          .send(payload);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('uuid');
        
        await db.query('DELETE FROM "posts" WHERE uuid = $1', [response.body.uuid]);
      });
    });

    describe('when data is invalid', () => {
      it('should return 400 when title is missing', async () => {
        const response = await request(app)
          .post('/posts')
          .send({ content: 'Content content content', author: 'Author' });

        expect(response.status).toBe(400);
      });
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update a post successfully', async () => {
      const res = await db.query('INSERT INTO "posts" (title, content, author) VALUES ($1, $2, $3) RETURNING *', ['Old Title', 'Old Content with length', 'Author']);
      const post = res.rows[0];

      const response = await request(app)
        .put(`/posts/${post.uuid}`)
        .send({ title: 'New Title' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('New Title');

      await db.query('DELETE FROM "posts" WHERE uuid = $1', [post.uuid]);
    });

    it('should return 404 when updating non-existent post', async () => {
      const response = await request(app)
        .put('/posts/00000000-0000-0000-0000-000000000000')
        .send({ title: 'New Title' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete a post successfully', async () => {
      const res = await db.query('INSERT INTO "posts" (title, content, author) VALUES ($1, $2, $3) RETURNING *', ['To delete', 'Content content content', 'Author']);
      const post = res.rows[0];

      const response = await request(app).delete(`/posts/${post.uuid}`);

      expect(response.status).toBe(204);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return 200 and the post when ID exists', async () => {
      const res = await db.query('INSERT INTO "posts" (title, content, author) VALUES ($1, $2, $3) RETURNING *', ['Exist', 'Content with enough length', 'Author']);
      const post = res.rows[0];
      const response = await request(app).get(`/posts/${post.uuid}`);
      expect(response.status).toBe(200);
      expect(response.body.uuid).toBe(post.uuid);

      await db.query('DELETE FROM "posts" WHERE uuid = $1', [post.uuid]);
    });

    it('should return 404 when ID does not exist', async () => {
      const response = await request(app).get('/posts/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Post not found');
    });
  });

  describe('GET /posts/search', () => {
    it('should return posts matching the query', async () => {
      const res = await db.query('INSERT INTO "posts" (title, content, author) VALUES ($1, $2, $3) RETURNING *', ['KeywordMatch', 'Content with enough length', 'Author']);
      const post = res.rows[0];
      const response = await request(app).get('/posts/search?q=Keyword');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((p: any) => p.uuid === post.uuid)).toBe(true);

      await db.query('DELETE FROM "posts" WHERE uuid = $1', [post.uuid]);
    });
  });
});
