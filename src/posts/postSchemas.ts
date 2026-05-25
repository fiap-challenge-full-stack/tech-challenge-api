import { z } from 'zod';

export const createPostSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  conteudo: z.string().min(10, 'O conteúdo deve ter pelo menos 10 caracteres'),
  autor: z.string().min(2, 'O autor deve ter pelo menos 2 caracteres'),
});

export const updatePostSchema = z.object({
  titulo: z.string().min(3).optional(),
  conteudo: z.string().min(10).optional(),
  autor: z.string().min(2).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Pelo menos um campo deve ser fornecido para atualização",
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
