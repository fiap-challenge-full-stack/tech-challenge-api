import { Router } from 'express';
import { autenticar } from '../auth/authMiddleware';
import { container } from '../shared/container';

const comentarioController = container.comentarios.controller;

// Comentários de um post: leitura pública, criação exige apenas autenticação
// (qualquer papel pode comentar).
const postComentarioRouter = Router({ mergeParams: true });
postComentarioRouter.get('/', (req, res) => comentarioController.listByPost(req, res));
postComentarioRouter.post('/', autenticar, (req, res) => comentarioController.create(req, res));

// Edição e exclusão (lógica, com placeholder "apagado") por uuid do
// comentário: exigem autenticação; a checagem de posse é feita no service
// (edição: somente o autor; exclusão: autor do comentário ou admin).
const comentarioRouter = Router();
comentarioRouter.patch('/:uuid', autenticar, (req, res) => comentarioController.update(req, res));
comentarioRouter.delete('/:uuid', autenticar, (req, res) => comentarioController.delete(req, res));

export { postComentarioRouter, comentarioRouter };
