import { Usuario } from './usuario';
import {
  IAtualizarUsuarioDados,
  IFindAllUsuariosOptions,
  IFindAllUsuariosResult,
  IUsuarioRepository,
} from './usuarioRepository';

export class MemoryUsuarioRepository implements IUsuarioRepository {
  private usuarios: Map<string, Usuario> = new Map();

  async create(usuario: Omit<Usuario, 'uuid' | 'createdAt' | 'updatedAt'>): Promise<Usuario> {
    const uuid = crypto.randomUUID();
    const now = new Date();

    const novoUsuario = new Usuario({
      uuid,
      email: usuario.email,
      senha: usuario.senha,
      nome: usuario.nome,
      papel: usuario.papel,
      createdAt: now,
      updatedAt: now
    });

    this.usuarios.set(uuid, novoUsuario);
    return novoUsuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    for (const usuario of this.usuarios.values()) {
      if (usuario.email === email) {
        return usuario;
      }
    }
    return null;
  }

  async findByUuid(uuid: string): Promise<Usuario | null> {
    return this.usuarios.get(uuid) || null;
  }

  async findAll(options?: IFindAllUsuariosOptions): Promise<IFindAllUsuariosResult> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;
    let todos = Array.from(this.usuarios.values());

    if (options?.papel) {
      todos = todos.filter((usuario) => usuario.papel === options.papel);
    }

    todos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = todos.length;
    const inicio = (page - 1) * pageSize;
    const usuarios = todos.slice(inicio, inicio + pageSize);

    return { usuarios, total };
  }

  async update(uuid: string, dados: IAtualizarUsuarioDados): Promise<Usuario> {
    const existente = this.usuarios.get(uuid);
    if (!existente) {
      throw new Error('Usuario not found');
    }

    const atualizado = new Usuario({
      uuid: existente.uuid,
      email: dados.email ?? existente.email,
      senha: dados.senha ?? existente.senha,
      nome: dados.nome ?? existente.nome,
      papel: dados.papel ?? existente.papel,
      createdAt: existente.createdAt,
      updatedAt: new Date(),
    });

    this.usuarios.set(uuid, atualizado);
    return atualizado;
  }

  async delete(uuid: string): Promise<void> {
    this.usuarios.delete(uuid);
  }

  async countByPapel(papel: string): Promise<number> {
    return Array.from(this.usuarios.values()).filter((usuario) => usuario.papel === papel).length;
  }

  clear(): void {
    this.usuarios.clear();
  }
}
