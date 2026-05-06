import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { db } from '../../src/lib/db';

const prisma = new PrismaClient();

export interface AuthFixtureResult {
  token: string;
  usuario: {
    uuid: string;
    email: string;
    nome: string;
    papel: string;
  };
}

export async function criarTokenDeTeste(papel: 'docente' | 'admin' = 'docente'): Promise<AuthFixtureResult> {
  const timestamp = Date.now();
  const email = `test-${timestamp}@test.com`;
  const senha = 'senha123';
  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuario.create({
    data: {
      email,
      senha: senhaHash,
      nome: 'Test User',
      papel
    }
  });

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  const token = jwt.sign(
    {
      uuid: usuario.uuid,
      email: usuario.email,
      nome: usuario.nome,
      papel: usuario.papel
    },
    jwtSecret,
    { expiresIn: '1h' }
  );

  return {
    token,
    usuario: {
      uuid: usuario.uuid,
      email: usuario.email,
      nome: usuario.nome,
      papel: usuario.papel
    }
  };
}

export async function limparUsuariosDeTeste(): Promise<void> {
  await prisma.usuario.deleteMany({
    where: {
      email: {
        startsWith: 'test-'
      }
    }
  });
}

export async function limparUsuarioPorEmail(email: string): Promise<void> {
  await prisma.usuario.deleteMany({
    where: { email }
  });
}
