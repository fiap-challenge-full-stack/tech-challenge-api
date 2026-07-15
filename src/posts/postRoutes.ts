import { Router } from 'express';
import { PostController } from './postController';
import { PostService } from './postService';
import { NativeSqlPostRepository } from './nativeSqlPostRepository';
import { autenticar, autorizar } from '../auth/authMiddleware';
import { postComentarioRouter } from '../comentarios/comentarioRoutes';

const postRouter = Router();

// Injeção de Dependência Manual (SQL Nativo / PostgreSQL)
const repository = new NativeSqlPostRepository();
const service = new PostService(repository);
const controller = new PostController(service);

// Rotas públicas (leitura)
postRouter.get('/', (req, res) => controller.list(req, res));
postRouter.get('/search', (req, res) => controller.search(req, res));
postRouter.get('/:uuid', (req, res) => controller.getById(req, res));

// Comentários de um post (leitura pública, criação autenticada)
postRouter.use('/:postUuid/comentarios', postComentarioRouter);

// Rotas de teste (apenas em modo de teste)
if (process.env.NODE_ENV !== 'production') {
  postRouter.post('/seed', (req, res) => controller.seed(req, res));
  postRouter.delete('/cleanup', (req, res) => controller.cleanup(req, res));
}

// Rotas protegidas (escrita) - requer autenticação
postRouter.post('/', autenticar, autorizar(['docente', 'admin']), (req, res) => controller.create(req, res));
postRouter.patch('/:uuid', autenticar, autorizar(['docente', 'admin']), (req, res) => controller.update(req, res));
postRouter.delete('/:uuid', autenticar, autorizar(['docente', 'admin']), (req, res) => controller.delete(req, res));

export { postRouter };
