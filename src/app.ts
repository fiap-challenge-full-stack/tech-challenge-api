import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { postRouter } from './posts/postRoutes';
import { authRouter } from './auth/authRoutes';
import metricsRouter from './metrics/metricsRoutes';
import { testModeMiddleware } from './shared/testModeMiddleware';
import { testCleanupRouter } from './shared/testCleanupRoutes';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { setCSPHeaders } from './middleware/csp';

const app = express();

app.use(helmet());
app.use(setCSPHeaders);

// Configurar CORS com origens específicas
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://seu-dominio.com']
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Não permitido pelo CORS'))
    }
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(testModeMiddleware);

// Aplicar rate limiting
app.use('/api/', apiLimiter)
app.use('/api/auth', authLimiter)

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRouter);
app.use('/posts', postRouter);
app.use('/metrics', metricsRouter);
app.use('/test', testCleanupRouter);

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
