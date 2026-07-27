import { Seguidor } from './seguidor';
import { Usuario } from '../auth/usuario';

export interface ISeguidorRepository {
  seguir(seguidorUuid: string, seguidoUuid: string): Promise<Seguidor>;
  deixarDeSeguir(seguidorUuid: string, seguidoUuid: string): Promise<void>;
  buscarPorSeguidorESeguido(seguidorUuid: string, seguidoUuid: string): Promise<Seguidor | null>;
  listarSeguindo(seguidorUuid: string): Promise<Usuario[]>;
  listarSeguidores(seguidoUuid: string): Promise<string[]>;
}
