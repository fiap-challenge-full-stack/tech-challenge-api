import { Response } from 'express';
import {
  ComentarioService,
  ComentarioNotFoundError,
  PostDoComentarioNotFoundError,
  ComentarioOperacaoNaoPermitidaError,
} from './comentarioService';
import { createComentarioSchema } from './comentarioSchemas';
import { ZodError } from 'zod';
import { CodigoErro, criarErro } from '../shared/erros';
import { logError } from '../shared/logger';
import { IAuthRequest } from '../auth/authMiddleware';

function comentarioPublico(comentario: {
  uuid: string | null;
  postUuid: string;
  autorUuid: string;
  autorNome: string;
  conteudo: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    uuid: comentario.uuid,
    postUuid: comentario.postUuid,
    autorUuid: comentario.autorUuid,
    autorNome: comentario.autorNome,
    conteudo: comentario.conteudo,
    criadoEm: comentario.createdAt,
    atualizadoEm: comentario.updatedAt,
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) {}

  private isValidUuid(uuid: string): boolean {
    return UUID_REGEX.test(uuid);
  }

  private handleError(error: unknown, res: Response): Response {
    if (error instanceof ZodError) {
      return res.status(400).json({
        codigo: CodigoErro.VALIDACAO_CAMPO_INVALIDO,
        message: 'Falha na validação dos campos',
        errors: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    if (error instanceof PostDoComentarioNotFoundError) {
      return res.status(404).json({
        codigo: CodigoErro.POST_NAO_ENCONTRADO,
        message: 'Post não encontrado',
      });
    }

    if (error instanceof ComentarioNotFoundError) {
      return res.status(404).json({
        codigo: CodigoErro.COMENTARIO_NAO_ENCONTRADO,
        message: 'Comentário não encontrado',
      });
    }

    if (error instanceof ComentarioOperacaoNaoPermitidaError) {
      return res.status(403).json({
        codigo: CodigoErro.COMENTARIO_OPERACAO_NAO_PERMITIDA,
        message: 'Operação não permitida para este usuário',
      });
    }

    logError(error instanceof Error ? error : new Error(String(error)), 'ComentarioController');
    const erroApp = criarErro(CodigoErro.SERVIDOR_INTERNO);
    return res.status(500).json({
      codigo: erroApp.codigo,
      message: erroApp.message,
    });
  }

  async create(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.usuario) {
        return res.status(401).json({
          codigo: CodigoErro.AUTHZ_NAO_AUTENTICADO,
          message: 'Usuário não autenticado',
        });
      }

      const postUuid = req.params.postUuid as string;
      if (!postUuid || !this.isValidUuid(postUuid)) {
        return res.status(400).json({
          codigo: CodigoErro.VALIDACAO_CAMPO_INVALIDO,
          message: 'ID do post inválido. Deve ser um UUID válido.',
        });
      }

      const validatedData = createComentarioSchema.parse(req.body);
      const comentario = await this.comentarioService.create(postUuid, validatedData, req.usuario);

      return res.status(201).json({
        sucesso: true,
        dados: comentarioPublico(comentario),
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async listByPost(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const postUuid = req.params.postUuid as string;
      if (!postUuid || !this.isValidUuid(postUuid)) {
        return res.status(400).json({
          codigo: CodigoErro.VALIDACAO_CAMPO_INVALIDO,
          message: 'ID do post inválido. Deve ser um UUID válido.',
        });
      }

      const comentarios = await this.comentarioService.listByPost(postUuid);

      return res.status(200).json({
        sucesso: true,
        dados: comentarios.map(comentarioPublico),
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async delete(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.usuario) {
        return res.status(401).json({
          codigo: CodigoErro.AUTHZ_NAO_AUTENTICADO,
          message: 'Usuário não autenticado',
        });
      }

      const uuid = req.params.uuid as string;
      if (!uuid || !this.isValidUuid(uuid)) {
        return res.status(400).json({
          codigo: CodigoErro.VALIDACAO_CAMPO_INVALIDO,
          message: 'ID do comentário inválido. Deve ser um UUID válido.',
        });
      }

      await this.comentarioService.delete(uuid, req.usuario);
      return res.status(204).send();
    } catch (error) {
      return this.handleError(error, res);
    }
  }
}
