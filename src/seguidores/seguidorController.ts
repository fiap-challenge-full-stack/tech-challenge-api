import { Response } from 'express';
import { IAuthRequest } from '../auth/authMiddleware';
import { SeguidorService } from './seguidorService';

export class SeguidorController {
  constructor(private readonly seguidorService: SeguidorService) {}

  async seguir(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const seguidorUuid = req.usuario?.uuid;
      const seguidoUuid = req.params.uuid as string;

      if (!seguidorUuid) {
        return res.status(401).json({ message: 'Não autenticado.' });
      }

      await this.seguidorService.seguir(seguidorUuid, seguidoUuid);
      return res.status(200).json({ message: 'Seguindo com sucesso.' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Usuário a ser seguido não encontrado.') {
          return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Você não pode seguir a si mesmo.') {
          return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Erro interno do servidor', detail: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async deixarDeSeguir(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const seguidorUuid = req.usuario?.uuid;
      const seguidoUuid = req.params.uuid as string;

      if (!seguidorUuid) {
        return res.status(401).json({ message: 'Não autenticado.' });
      }

      await this.seguidorService.deixarDeSeguir(seguidorUuid, seguidoUuid);
      return res.status(200).json({ message: 'Deixou de seguir com sucesso.' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Você não segue este usuário.' || error.message === 'Você não pode deixar de seguir a si mesmo.') {
          return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Erro interno do servidor', detail: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async listarSeguindo(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const seguidorUuid = req.usuario?.uuid;

      if (!seguidorUuid) {
        return res.status(401).json({ message: 'Não autenticado.' });
      }

      const seguindo = await this.seguidorService.listarSeguindo(seguidorUuid);
      return res.status(200).json(seguindo.map((usuario) => usuario.toJSON()));
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ message: 'Erro interno do servidor', detail: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}
