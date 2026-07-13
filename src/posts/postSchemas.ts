import { z } from 'zod';

// O campo `autor` nunca é aceito do corpo da requisição (API-06): a
// autoria é sempre derivada do usuário autenticado (req.usuario), nunca de
// um valor enviado manualmente pelo cliente.
export const createPostSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  conteudo: z.string().min(10, 'O conteúdo deve ter pelo menos 10 caracteres'),
});

export const updatePostSchema = z.object({
  titulo: z.string().min(3).optional(),
  conteudo: z.string().min(10).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Pelo menos um campo deve ser fornecido para atualização",
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
