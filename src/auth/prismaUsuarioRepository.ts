import { PrismaClient } from '@prisma/client';
import { Usuario } from './usuario';
import { IUsuarioRepository } from './usuarioRepository';

export class PrismaUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(usuario: { email: string; senha: string; nome: string; papel: string }): Promise<Usuario> {
    const novoUsuario = await this.prisma.usuario.create({
      data: {
        email: usuario.email,
        senha: usuario.senha,
        nome: usuario.nome,
        papel: usuario.papel
      }
    });

    return new Usuario({
      uuid: novoUsuario.uuid,
      email: novoUsuario.email,
      senha: novoUsuario.senha,
      nome: novoUsuario.nome,
      papel: novoUsuario.papel,
      createdAt: novoUsuario.createdAt,
      updatedAt: novoUsuario.updatedAt
    });
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) return null;

    return new Usuario({
      uuid: usuario.uuid,
      email: usuario.email,
      senha: usuario.senha,
      nome: usuario.nome,
      papel: usuario.papel,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt
    });
  }

  async findByUuid(uuid: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { uuid }
    });

    if (!usuario) return null;

    return new Usuario({
      uuid: usuario.uuid,
      email: usuario.email,
      senha: usuario.senha,
      nome: usuario.nome,
      papel: usuario.papel,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt
    });
  }

  async findAll(): Promise<Usuario[]> {
    const usuarios = await this.prisma.usuario.findMany();

    return usuarios.map(usuario => new Usuario({
      uuid: usuario.uuid,
      email: usuario.email,
      senha: usuario.senha,
      nome: usuario.nome,
      papel: usuario.papel,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt
    }));
  }
}
