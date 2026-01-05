import { Router } from 'express';
import { cambiosController } from '../controllers/cambios.controller.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

// Público: listado de cambios (para landing y otros clientes)
router.get('/', cambiosController.list);

// Protegido: creación de nuevos cambios desde el panel admin
router.post('/', requireAuth, cambiosController.create);

export default router;
