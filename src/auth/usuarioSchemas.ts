import { z } from 'zod';

// Papéis formalizados via Zod (mantidos como string no Prisma para evitar
// migração destrutiva de dados já existentes; a validação de valores
// permitidos acontece inteiramente na camada de aplicação).
export const PAPEIS_USUARIO = ['docente', 'admin', 'aluno'] as const;
export const papelSchema = z.enum(PAPEIS_USUARIO);
export type PapelUsuario = z.infer<typeof papelSchema>;

// Regras de força mínima de senha (API-05)
export const senhaSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .regex(/[a-z]/, 'A senha deve conter ao menos uma letra minúscula')
  .regex(/[A-Z]/, 'A senha deve conter ao menos uma letra maiúscula')
  .regex(/[0-9]/, 'A senha deve conter ao menos um número')
  .regex(/[^A-Za-z0-9]/, 'A senha deve conter ao menos um caractere especial');

// Registro público (POST /auth/registrar): o campo `papel` é intencionalmente
// omitido do schema para impedir que o cliente se autopromova (API-02).
// O papel padrão é sempre definido no servidor.
export const createUsuarioSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: senhaSchema,
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
});

// Criação administrativa (POST /usuarios): somente acessível por admin,
// permite definir o papel do novo usuário.
export const adminCreateUsuarioSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: senhaSchema,
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  papel: papelSchema.default('docente'),
});

// Atualização (PUT/PATCH /usuarios/:uuid)
export const updateUsuarioSchema = z
  .object({
    nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').optional(),
    email: z.string().email('Email inválido').optional(),
    senha: senhaSchema.optional(),
    papel: papelSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  });

export const listUsuariosQuerySchema = z.object({
  page: z.coerce.number().int('page deve ser um número inteiro').min(1).default(1),
  pageSize: z.coerce.number().int('pageSize deve ser um número inteiro').min(1).max(100).default(10),
  papel: papelSchema.optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'A senha é obrigatória'),
});

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type AdminCreateUsuarioInput = z.infer<typeof adminCreateUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
export type ListUsuariosQuery = z.infer<typeof listUsuariosQuerySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
