import { Seguidor } from './seguidor';

export interface ISeguidorRepository {
  seguir(seguidorUuid: string, seguidoUuid: string): Promise<Seguidor>;
  deixarDeSeguir(seguidorUuid: string, seguidoUuid: string): Promise<void>;
  buscarPorSeguidorESeguido(seguidorUuid: string, seguidoUuid: string): Promise<Seguidor | null>;
  listarSeguindo(seguidorUuid: string): Promise<string[]>;
  listarSeguidores(seguidoUuid: string): Promise<string[]>;
}
