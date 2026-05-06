import { Router } from 'express';
import { PostController } from './postController';
import { PostService } from './postService';
import { NativeSqlPostRepository } from './nativeSqlPostRepository';
import { autenticar, autorizar } from '../auth/authMiddleware';

const postRouter = Router();

// Injeção de Dependência Manual (SQL Nativo / PostgreSQL)
const repository = new NativeSqlPostRepository();
const service = new PostService(repository);
const controller = new PostController(service);

// Rotas públicas (leitura)
postRouter.get('/', (req, res) => controller.list(req, res));
postRouter.get('/search', (req, res) => controller.search(req, res));
postRouter.get('/:id', (req, res) => controller.getById(req, res));

// Rotas protegidas (escrita) - requer autenticação
postRouter.post('/', autenticar, autorizar(['docente', 'admin']), (req, res) => controller.create(req, res));
postRouter.put('/:id', autenticar, autorizar(['docente', 'admin']), (req, res) => controller.update(req, res));
postRouter.delete('/:id', autenticar, autorizar(['docente', 'admin']), (req, res) => controller.delete(req, res));

export { postRouter };
