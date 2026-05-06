import { Usuario } from './usuario';
import { IUsuarioRepository } from './usuarioRepository';

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

  async findAll(): Promise<Usuario[]> {
    return Array.from(this.usuarios.values());
  }

  clear(): void {
    this.usuarios.clear();
  }
}
