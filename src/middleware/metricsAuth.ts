import { Request, Response, NextFunction } from 'express';

export function metricsAuth(req: Request, res: Response, next: NextFunction) {
  // Allow local requests without auth (optional, but good for local checks)
  const ip = req.ip || req.socket.remoteAddress || '';
  if (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.endsWith('127.0.0.1')
  ) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Metrics"');
    return res.status(401).json({ message: 'Autenticação necessária' });
  }

  try {
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    const expectedUser = process.env.METRICS_USER || 'admin';
    const expectedPass = process.env.METRICS_PASS || 'admin';

    if (username === expectedUser && password === expectedPass) {
      return next();
    }
  } catch (error) {
    // Falha na decodificação ou processamento das credenciais
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Metrics"');
  return res.status(401).json({ message: 'Credenciais inválidas' });
}
