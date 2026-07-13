import { Router } from 'express';
import { container } from '../shared/container';
import { autenticar, autorizar } from './authMiddleware';

const router = Router();

// Todas as rotas de usuários exigem autenticação.
router.use(autenticar);

// Somente admin pode listar e criar usuários com papel arbitrário (API-03/API-04).
router.get('/', autorizar(['admin']), (req, res) => container.usuarios.controller.list(req, res));
router.post('/', autorizar(['admin']), (req, res) => container.usuarios.controller.create(req, res));

// Consulta, atualização e remoção: admin gerencia qualquer usuário; um
// usuário comum só pode operar sobre a própria conta (checado no controller/service).
router.get('/:uuid', (req, res) => container.usuarios.controller.getById(req, res));
router.put('/:uuid', (req, res) => container.usuarios.controller.update(req, res));
router.patch('/:uuid', (req, res) => container.usuarios.controller.update(req, res));
router.delete('/:uuid', (req, res) => container.usuarios.controller.remove(req, res));

export { router as usuarioRouter };
