import { Usuario } from './usuario';

export interface IUsuarioRepository {
  create(usuario: { email: string; senha: string; nome: string; papel: string }): Promise<Usuario>;
  findByEmail(email: string): Promise<Usuario | null>;
  findByUuid(uuid: string): Promise<Usuario | null>;
  findAll(): Promise<Usuario[]>;
}
