import { PrismaClient, Prisma } from '@prisma/client';

type PrismaClientOuTransacao = PrismaClient | Prisma.TransactionClient;
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

function ehPrismaClientCompleto(client: PrismaClientOuTransacao): client is PrismaClient {
  return typeof (client as PrismaClient).$transaction === 'function';
}

export class PrismaUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaClientOuTransacao) {}

  async create(usuario: Usuario): Promise<Usuario> {
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

    const [usuarios, total] = ehPrismaClientCompleto(this.prisma)
      ? await this.prisma.$transaction([
          this.prisma.usuario.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
          }),
          this.prisma.usuario.count({ where }),
        ])
      : await Promise.all([
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

  // Bloqueia (`FOR UPDATE`) as linhas do papel informado. Só tem efeito real
  // de bloqueio quando executado dentro de uma transação (`executarEmTransacao`);
  // fora dela, o Postgres libera o lock assim que a query termina.
  // `FOR UPDATE` não é permitido com funções de agregação, por isso contamos
  // os ids retornados em vez de usar `COUNT(*)` na própria query.
  async countByPapelParaAtualizacao(papel: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM "usuarios" WHERE papel = ${papel} FOR UPDATE
    `;
    return rows.length;
  }

  async executarEmTransacao<T>(fn: (repo: IUsuarioRepository) => Promise<T>): Promise<T> {
    if (!ehPrismaClientCompleto(this.prisma)) {
      // Já estamos dentro de uma transação (repositório criado a partir de um
      // `Prisma.TransactionClient`); apenas reutiliza o repositório atual.
      return fn(this);
    }

    return this.prisma.$transaction(async (tx) => {
      const repositorioTransacional = new PrismaUsuarioRepository(tx);
      return fn(repositorioTransacional);
    });
  }
}
