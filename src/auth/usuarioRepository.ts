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
  // Igual a `countByPapel`, mas deve bloquear as linhas contadas (ex.: `SELECT
  // ... FOR UPDATE`) quando chamado dentro de `executarEmTransacao`, para
  // evitar condição de corrida entre requisições concorrentes que removem/
  // rebaixam os últimos administradores do sistema.
  countByPapelParaAtualizacao(papel: string): Promise<number>;
  // Executa `fn` com um repositório vinculado a uma transação (quando
  // suportado pela implementação). Implementações sem suporte real a
  // transações (ex.: repositório em memória) apenas executam `fn` diretamente.
  executarEmTransacao<T>(fn: (repo: IUsuarioRepository) => Promise<T>): Promise<T>;
}
