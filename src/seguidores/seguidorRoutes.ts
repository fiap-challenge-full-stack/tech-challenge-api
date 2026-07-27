import { Router } from 'express';
import { container } from '../shared/container';
import { autenticar } from '../auth/authMiddleware';

const router = Router({ mergeParams: true });

router.use(autenticar);

router.get('/me/seguindo', (req, res) => container.seguidores.controller.listarSeguindo(req, res));
router.post('/:uuid/seguir', (req, res) => container.seguidores.controller.seguir(req, res));
router.delete('/:uuid/seguir', (req, res) => container.seguidores.controller.deixarDeSeguir(req, res));

export { router as seguidorRouter };
