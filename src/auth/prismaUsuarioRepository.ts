import { PrismaClient, Prisma } from '@prisma/client';
import { Usuario } from './usuario';
import {
  IAtualizarUsuarioDados,
  IFindAllUsuariosOptions,
  IFindAllUsuariosResult,
  IUsuarioRepository,
} from './usuarioRepository';

type UsuarioRow = {
  uuid: string;
  email: string;
  senha: string;
  nome: string;
  papel: string;
  createdAt: Date;
  updatedAt: Date;
};

function toDomain(row: UsuarioRow): Usuario {
  return new Usuario({
    uuid: row.uuid,
    email: row.email,
    senha: row.senha,
    nome: row.nome,
    papel: row.papel,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

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

    return toDomain(novoUsuario);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) return null;

    return toDomain(usuario);
  }

  async findByUuid(uuid: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { uuid }
    });

    if (!usuario) return null;

    return toDomain(usuario);
  }

  async findAll(options?: IFindAllUsuariosOptions): Promise<IFindAllUsuariosResult> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;
    const where: Prisma.UsuarioWhereInput = options?.papel ? { papel: options.papel } : {};

    const [usuarios, total] = await this.prisma.$transaction([
      this.prisma.usuario.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.usuario.count({ where }),
    ]);

    return {
      usuarios: usuarios.map(toDomain),
      total,
    };
  }

  async update(uuid: string, dados: IAtualizarUsuarioDados): Promise<Usuario> {
    const usuarioAtualizado = await this.prisma.usuario.update({
      where: { uuid },
      data: {
        ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
        ...(dados.email !== undefined ? { email: dados.email } : {}),
        ...(dados.senha !== undefined ? { senha: dados.senha } : {}),
        ...(dados.papel !== undefined ? { papel: dados.papel } : {}),
      },
    });

    return toDomain(usuarioAtualizado);
  }

  async delete(uuid: string): Promise<void> {
    await this.prisma.usuario.delete({ where: { uuid } });
  }

  async countByPapel(papel: string): Promise<number> {
    return this.prisma.usuario.count({ where: { papel } });
  }
}
