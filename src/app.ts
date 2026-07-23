import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { postRouter } from './posts/postRoutes';
import { authRouter } from './auth/authRoutes';
import { usuarioRouter } from './auth/usuarioRoutes';
import { comentarioRouter } from './comentarios/comentarioRoutes';
import metricsRouter from './metrics/metricsRoutes';
import { testModeMiddleware } from './shared/testModeMiddleware';
import { testCleanupRouter } from './shared/testCleanupRoutes';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { setCSPHeaders } from './middleware/csp';

const app = express();

app.use(helmet());
app.use(setCSPHeaders);

// Configurar CORS para permitir web frontend, mobile app e ambiente local
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      process.env.NODE_ENV !== 'production' ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('exp://')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') {
  app.use(testModeMiddleware);
}

// Aplicar rate limiting
app.use('/auth', authLimiter);
app.use('/', apiLimiter);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRouter);
app.use('/usuarios', usuarioRouter);
app.use('/posts', postRouter);
app.use('/comentarios', comentarioRouter);
app.use('/metrics', metricsRouter);

if (process.env.NODE_ENV !== 'production') {
  app.use('/test', testCleanupRouter);
}

// Tratador de erro global (deve ser o último middleware)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error & { status?: number; body?: unknown }, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && err.status === 400 && err.body) {
    return res.status(400).json({ message: 'JSON malformado ou inválido' });
  }
  
  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

export default app;
