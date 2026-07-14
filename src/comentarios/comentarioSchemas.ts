import { z } from 'zod';

// O `autor` nunca é aceito do corpo da requisição (mesmo padrão de posts,
// API-06): a autoria é sempre derivada do usuário autenticado.
export const createComentarioSchema = z.object({
  conteudo: z.string().min(3, 'O comentário deve ter pelo menos 3 caracteres').max(1000, 'O comentário deve ter no máximo 1000 caracteres'),
});

export type CreateComentarioInput = z.infer<typeof createComentarioSchema>;
