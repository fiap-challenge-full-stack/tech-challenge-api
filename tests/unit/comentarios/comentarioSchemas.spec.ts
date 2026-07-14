import { createComentarioSchema } from '@/comentarios/comentarioSchemas';

describe('ComentarioSchemas Validation', () => {
  describe('createComentarioSchema', () => {
    it('should validate correctly with valid data', () => {
      const result = createComentarioSchema.safeParse({ conteudo: 'Muito bom esse post!' });
      expect(result.success).toBe(true);
    });

    it('should fail if conteudo is too short', () => {
      const result = createComentarioSchema.safeParse({ conteudo: 'Oi' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('O comentário deve ter pelo menos 3 caracteres');
      }
    });

    it('should fail if conteudo exceeds the max length', () => {
      const result = createComentarioSchema.safeParse({ conteudo: 'a'.repeat(1001) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('O comentário deve ter no máximo 1000 caracteres');
      }
    });

    it('should fail if conteudo is missing', () => {
      const result = createComentarioSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
