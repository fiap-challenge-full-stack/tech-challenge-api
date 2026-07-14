import { Router } from 'express';
import { ComentarioController } from './comentarioController';
import { ComentarioService } from './comentarioService';
import { NativeSqlComentarioRepository } from './nativeSqlComentarioRepository';
import { NativeSqlPostRepository } from '../posts/nativeSqlPostRepository';
import { autenticar } from '../auth/authMiddleware';

const comentarioRepository = new NativeSqlComentarioRepository();
const postRepository = new NativeSqlPostRepository();
const comentarioService = new ComentarioService(comentarioRepository, postRepository);
const comentarioController = new ComentarioController(comentarioService);

// Comentários de um post: leitura pública, criação exige apenas autenticação
// (qualquer papel pode comentar).
const postComentarioRouter = Router({ mergeParams: true });
postComentarioRouter.get('/', (req, res) => comentarioController.listByPost(req, res));
postComentarioRouter.post('/', autenticar, (req, res) => comentarioController.create(req, res));

// Exclusão por uuid do comentário: exige autenticação; a checagem de posse
// (autor do comentário ou admin) é feita no service.
const comentarioRouter = Router();
comentarioRouter.delete('/:uuid', autenticar, (req, res) => comentarioController.delete(req, res));

export { postComentarioRouter, comentarioRouter };
