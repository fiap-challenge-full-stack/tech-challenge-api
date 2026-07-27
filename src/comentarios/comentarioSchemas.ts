import { z } from 'zod';

// O `autor` nunca é aceito do corpo da requisição (mesmo padrão de posts,
// API-06): a autoria é sempre derivada do usuário autenticado.
export const createComentarioSchema = z.object({
  conteudo: z.string().min(3, 'O comentário deve ter pelo menos 3 caracteres').max(1000, 'O comentário deve ter no máximo 1000 caracteres'),
});

export type CreateComentarioInput = z.infer<typeof createComentarioSchema>;

export const updateComentarioSchema = z.object({
  conteudo: z.string().min(3, 'O comentário deve ter pelo menos 3 caracteres').max(1000, 'O comentário deve ter no máximo 1000 caracteres'),
});

export type UpdateComentarioInput = z.infer<typeof updateComentarioSchema>;

// Paginação da listagem de comentários (mesmo padrão de `/usuarios`):
// a API devolve os mais recentes primeiro, e o cliente carrega páginas seguintes sob demanda.
export const listComentariosQuerySchema = z.object({
  page: z.coerce.number().int('page deve ser um número inteiro').min(1).default(1),
  pageSize: z.coerce.number().int('pageSize deve ser um número inteiro').min(1).max(50).default(10),
});

export type ListComentariosQuery = z.infer<typeof listComentariosQuerySchema>;
