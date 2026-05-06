import { Request, Response } from 'express';
import { AuthService, InvalidCredentialsError, UsuarioAlreadyExistsError } from './authService';
import { createUsuarioSchema, loginSchema } from './usuarioSchemas';
import { ZodError } from 'zod';
import { ErroAplicacao, CodigoErro, criarErro } from '../shared/erros';
import { logError } from '../shared/logger';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private handleError(error: unknown, res: Response): Response {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        codigo: CodigoErro.VALIDACAO_CAMPO_INVALIDO,
        message: 'Falha na validação dos campos', 
        errors: error.issues.map((err) => ({ 
          field: err.path.join('.'), 
          message: err.message 
        }))
      });
    }

    if (error instanceof InvalidCredentialsError) {
      return res.status(401).json({ 
        codigo: CodigoErro.AUTH_CREDENCIAIS_INVALIDAS,
        message: 'Credenciais inválidas' 
      });
    }

    if (error instanceof UsuarioAlreadyExistsError) {
      return res.status(409).json({ 
        codigo: CodigoErro.AUTH_USUARIO_JA_EXISTE,
        message: 'Usuário já existe' 
      });
    }

    if (error instanceof ErroAplicacao) {
      logError(error, 'AuthController');
      return res.status(500).json({ 
        codigo: error.codigo,
        message: error.message 
      });
    }

    logError(error instanceof Error ? error : new Error(String(error)), 'AuthController');
    const erroApp = criarErro(CodigoErro.SERVIDOR_INTERNO);
    return res.status(500).json({ 
      codigo: erroApp.codigo,
      message: erroApp.message 
    });
  }

  async registrar(req: Request, res: Response): Promise<Response> {
    try {
      const validatedData = createUsuarioSchema.parse(req.body);
      const result = await this.authService.registrar(validatedData);
      return res.status(201).json({
        usuario: result.usuario.toJSON(),
        token: result.token
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await this.authService.login(validatedData);
      return res.status(200).json({
        usuario: result.usuario.toJSON(),
        token: result.token
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }
}
