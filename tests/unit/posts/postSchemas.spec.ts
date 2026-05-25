import { createPostSchema, updatePostSchema } from '@/posts/postSchemas';

describe('PostSchemas Validation', () => {
  describe('createPostSchema', () => {
    it('should validate correctly with valid data', () => {
      const data = { title: 'Test Title', content: 'Valid content with 10+ chars', author: 'Author' };
      const result = createPostSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail if title is too short', () => {
      const data = { title: 'ab', content: 'Valid content with 10+ chars', author: 'Author' };
      const result = createPostSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('O título deve ter pelo menos 3 caracteres');
      }
    });

    it('should fail if content is too short', () => {
      const data = { title: 'Valid Title', content: 'Short', author: 'Author' };
      const result = createPostSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('O conteúdo deve ter pelo menos 10 caracteres');
      }
    });

    it('should fail if author is missing', () => {
      const data = { title: 'Valid Title', content: 'Valid content' } as any;
      const result = createPostSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should fail if data is empty', () => {
      const result = createPostSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('updatePostSchema', () => {
    it('should validate correctly with partial valid data', () => {
      const data = { title: 'New Title' };
      const result = updatePostSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail if at least one field is not provided', () => {
      const result = updatePostSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Pelo menos um campo deve ser fornecido para atualização');
      }
    });

    it('should fail with invalid types', () => {
      const data = { title: 123 } as any;
      const result = updatePostSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
