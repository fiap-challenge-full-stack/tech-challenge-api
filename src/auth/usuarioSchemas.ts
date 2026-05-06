import { z } from 'zod';

export const createUsuarioSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  papel: z.string().default('docente'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'A senha é obrigatória'),
});

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
