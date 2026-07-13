import { Response } from 'express';
import { ZodError } from 'zod';
import {
  UsuarioEmailEmUsoError,
  UsuarioNaoEncontradoError,
  UsuarioOperacaoNaoPermitidaError,
  UsuarioService,
  UsuarioUltimoAdminError,
} from './usuarioService';
import {
  adminCreateUsuarioSchema,
  listUsuariosQuerySchema,
  updateUsuarioSchema,
} from './usuarioSchemas';
import { CodigoErro, criarErro, ErroAplicacao } from '../shared/erros';
import { logError } from '../shared/logger';
import { IAuthRequest } from './authMiddleware';

export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

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

    if (error instanceof UsuarioNaoEncontradoError) {
      return res.status(404).json({
        codigo: CodigoErro.USUARIO_NAO_ENCONTRADO,
        message: error.message,
      });
    }

    if (error instanceof UsuarioEmailEmUsoError) {
      return res.status(409).json({
        codigo: CodigoErro.USUARIO_EMAIL_EM_USO,
        message: error.message,
      });
    }

    if (error instanceof UsuarioUltimoAdminError) {
      return res.status(409).json({
        codigo: CodigoErro.USUARIO_ULTIMO_ADMIN,
        message: error.message,
      });
    }

    if (error instanceof UsuarioOperacaoNaoPermitidaError) {
      return res.status(403).json({
        codigo: CodigoErro.USUARIO_OPERACAO_NAO_PERMITIDA,
        message: error.message,
      });
    }

    if (error instanceof ErroAplicacao) {
      logError(error, 'UsuarioController');
      return res.status(500).json({ codigo: error.codigo, message: error.message });
    }

    logError(error instanceof Error ? error : new Error(String(error)), 'UsuarioController');
    const erroApp = criarErro(CodigoErro.SERVIDOR_INTERNO);
    return res.status(500).json({ codigo: erroApp.codigo, message: erroApp.message });
  }

  async list(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const query = listUsuariosQuerySchema.parse(req.query);
      const resultado = await this.usuarioService.listar(query);

      return res.status(200).json({
        sucesso: true,
        dados: resultado.usuarios.map((u) => u.toJSON()),
        paginacao: {
          page: resultado.page,
          pageSize: resultado.pageSize,
          total: resultado.total,
          totalPaginas: Math.ceil(resultado.total / resultado.pageSize),
        },
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async getById(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const { uuid } = req.params;

      if (!req.usuario) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const ehAdmin = req.usuario.papel === 'admin';
      const ehProprioUsuario = req.usuario.uuid === uuid;
      if (!ehAdmin && !ehProprioUsuario) {
        return res.status(403).json({
          codigo: CodigoErro.USUARIO_OPERACAO_NAO_PERMITIDA,
          message: 'Você só pode consultar seus próprios dados',
        });
      }

      const usuario = await this.usuarioService.buscarPorUuid(uuid as string);
      return res.status(200).json({ sucesso: true, dados: usuario.toJSON() });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async create(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const dados = adminCreateUsuarioSchema.parse(req.body);
      const usuario = await this.usuarioService.criar(dados);
      return res.status(201).json({ sucesso: true, dados: usuario.toJSON() });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async update(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const { uuid } = req.params;
      const dados = updateUsuarioSchema.parse(req.body);

      if (!req.usuario) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const usuario = await this.usuarioService.atualizar(uuid as string, dados, {
        uuid: req.usuario.uuid,
        papel: req.usuario.papel,
      });

      return res.status(200).json({ sucesso: true, dados: usuario.toJSON() });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async remove(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const { uuid } = req.params;

      if (!req.usuario) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      await this.usuarioService.deletar(uuid as string, {
        uuid: req.usuario.uuid,
        papel: req.usuario.papel,
      });

      return res.status(204).send();
    } catch (error) {
      return this.handleError(error, res);
    }
  }
}
