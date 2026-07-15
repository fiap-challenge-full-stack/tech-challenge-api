import { Usuario } from './usuario';

export interface IFindAllUsuariosOptions {
  page: number;
  pageSize: number;
  papel?: string;
}

export interface IFindAllUsuariosResult {
  usuarios: Usuario[];
  total: number;
}

export interface IAtualizarUsuarioDados {
  nome?: string;
  email?: string;
  senha?: string;
  papel?: string;
}

export interface IUsuarioRepository {
  create(usuario: Usuario): Promise<Usuario>;
  findByEmail(email: string): Promise<Usuario | null>;
  findByUuid(uuid: string): Promise<Usuario | null>;
  findAll(options?: IFindAllUsuariosOptions): Promise<IFindAllUsuariosResult>;
  update(uuid: string, dados: IAtualizarUsuarioDados): Promise<Usuario>;
  delete(uuid: string): Promise<void>;
  countByPapel(papel: string): Promise<number>;
}
