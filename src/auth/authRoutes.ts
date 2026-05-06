import { Router } from 'express';
import { container } from '../shared/container';

const router = Router();

router.post('/registrar', (req, res) => container.auth.controller.registrar(req, res));
router.post('/login', (req, res) => container.auth.controller.login(req, res));

export { router as authRouter };
