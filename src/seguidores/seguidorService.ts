import { ISeguidorRepository } from './seguidorRepository';
import { IUsuarioRepository } from '../auth/usuarioRepository';
import { Seguidor } from './seguidor';
import { Usuario } from '../auth/usuario';

export class SeguidorService {
  constructor(
    private readonly seguidorRepository: ISeguidorRepository,
    private readonly usuarioRepository: IUsuarioRepository
  ) {}

  async seguir(seguidorUuid: string, seguidoUuid: string): Promise<Seguidor> {
    if (seguidorUuid === seguidoUuid) {
      throw new Error('Você não pode seguir a si mesmo.');
    }

    const usuarioSeguido = await this.usuarioRepository.findByUuid(seguidoUuid);
    if (!usuarioSeguido) {
      throw new Error('Usuário a ser seguido não encontrado.');
    }

    const existente = await this.seguidorRepository.buscarPorSeguidorESeguido(seguidorUuid, seguidoUuid);
    if (existente) {
      return existente; // Ou pode lançar erro 'Já segue'
    }

    return this.seguidorRepository.seguir(seguidorUuid, seguidoUuid);
  }

  async deixarDeSeguir(seguidorUuid: string, seguidoUuid: string): Promise<void> {
    if (seguidorUuid === seguidoUuid) {
      throw new Error('Você não pode deixar de seguir a si mesmo.');
    }

    const existente = await this.seguidorRepository.buscarPorSeguidorESeguido(seguidorUuid, seguidoUuid);
    if (!existente) {
      throw new Error('Você não segue este usuário.');
    }

    return this.seguidorRepository.deixarDeSeguir(seguidorUuid, seguidoUuid);
  }

  async listarSeguindo(seguidorUuid: string): Promise<Usuario[]> {
    return this.seguidorRepository.listarSeguindo(seguidorUuid);
  }
}
