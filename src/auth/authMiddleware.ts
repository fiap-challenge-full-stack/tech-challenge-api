import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  usuario?: {
    uuid: string;
    email: string;
    nome: string;
    papel: string;
  };
}

export function autenticar(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token não fornecido' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    const decoded = jwt.verify(token, JWT_SECRET) as {
      uuid: string;
      email: string;
      nome: string;
      papel: string;
    };

    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

export function autorizar(papeisPermitidos: string[] = ['docente', 'admin']) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    if (!papeisPermitidos.includes(req.usuario.papel)) {
      res.status(403).json({ message: 'Permissão insuficiente' });
      return;
    }

    next();
  };
}
