import bcrypt from 'bcryptjs';
import { Usuario } from './usuario';
import { IUsuarioRepository } from './usuarioRepository';
import { AdminCreateUsuarioInput, ListUsuariosQuery, UpdateUsuarioInput } from './usuarioSchemas';

export class UsuarioNaoEncontradoError extends Error {
  constructor() {
    super('Usuário não encontrado');
    this.name = 'UsuarioNaoEncontradoError';
  }
}

export class UsuarioEmailEmUsoError extends Error {
  constructor() {
    super('Email já está em uso por outro usuário');
    this.name = 'UsuarioEmailEmUsoError';
  }
}

export class UsuarioUltimoAdminError extends Error {
  constructor() {
    super('Não é possível remover o último administrador do sistema');
    this.name = 'UsuarioUltimoAdminError';
  }
}

export class UsuarioOperacaoNaoPermitidaError extends Error {
  constructor(mensagem = 'Operação não permitida para este usuário') {
    super(mensagem);
    this.name = 'UsuarioOperacaoNaoPermitidaError';
  }
}

export interface IRequisitante {
  uuid: string;
  papel: string;
}

export class UsuarioService {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async listar(query: ListUsuariosQuery): Promise<{ usuarios: Usuario[]; total: number; page: number; pageSize: number }> {
    const { usuarios, total } = await this.usuarioRepository.findAll({
      page: query.page,
      pageSize: query.pageSize,
      papel: query.papel,
    });

    return { usuarios, total, page: query.page, pageSize: query.pageSize };
  }

  async buscarPorUuid(uuid: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findByUuid(uuid);
    if (!usuario) throw new UsuarioNaoEncontradoError();
    return usuario;
  }

  async criar(data: AdminCreateUsuarioInput): Promise<Usuario> {
    const existente = await this.usuarioRepository.findByEmail(data.email);
    if (existente) {
      throw new UsuarioEmailEmUsoError();
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);

    return this.usuarioRepository.create({
      email: data.email,
      senha: senhaHash,
      nome: data.nome,
      papel: data.papel,
    });
  }

  async atualizar(uuid: string, data: UpdateUsuarioInput, requisitante: IRequisitante): Promise<Usuario> {
    const usuarioAlvo = await this.usuarioRepository.findByUuid(uuid);
    if (!usuarioAlvo) throw new UsuarioNaoEncontradoError();

    const ehAdmin = requisitante.papel === 'admin';
    const ehProprioUsuario = requisitante.uuid === uuid;

    if (!ehAdmin && !ehProprioUsuario) {
      throw new UsuarioOperacaoNaoPermitidaError('Você só pode atualizar seus próprios dados');
    }

    // Somente admin pode alterar o papel de um usuário. Usuários comuns que
    // tentarem enviar `papel` têm o campo ignorado silenciosamente para não
    // vazar detalhes de autorização, mas de forma segura (defesa em profundidade).
    const dadosPermitidos: { nome?: string; email?: string; senha?: string; papel?: string } = {
      nome: data.nome,
      email: data.email,
    };

    if (ehAdmin && data.papel !== undefined) {
      dadosPermitidos.papel = data.papel;
    }

    // Impede rebaixar o último admin do sistema.
    if (
      ehAdmin &&
      dadosPermitidos.papel !== undefined &&
      dadosPermitidos.papel !== 'admin' &&
      usuarioAlvo.papel === 'admin'
    ) {
      const totalAdmins = await this.usuarioRepository.countByPapel('admin');
      if (totalAdmins <= 1) {
        throw new UsuarioUltimoAdminError();
      }
    }

    if (data.senha !== undefined) {
      dadosPermitidos.senha = await bcrypt.hash(data.senha, 10);
    }

    if (data.email !== undefined && data.email !== usuarioAlvo.email) {
      const emailEmUso = await this.usuarioRepository.findByEmail(data.email);
      if (emailEmUso) {
        throw new UsuarioEmailEmUsoError();
      }
    }

    return this.usuarioRepository.update(uuid, dadosPermitidos);
  }

  async deletar(uuid: string, requisitante: IRequisitante): Promise<void> {
    const usuarioAlvo = await this.usuarioRepository.findByUuid(uuid);
    if (!usuarioAlvo) throw new UsuarioNaoEncontradoError();

    const ehAdmin = requisitante.papel === 'admin';
    const ehProprioUsuario = requisitante.uuid === uuid;

    if (!ehAdmin && !ehProprioUsuario) {
      throw new UsuarioOperacaoNaoPermitidaError('Você só pode remover sua própria conta');
    }

    if (usuarioAlvo.papel === 'admin') {
      const totalAdmins = await this.usuarioRepository.countByPapel('admin');
      if (totalAdmins <= 1) {
        throw new UsuarioUltimoAdminError();
      }
    }

    await this.usuarioRepository.delete(uuid);
  }
}
