import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import requireAuth from '../middleware/requireAuth.js';
import requireOwner from '../middleware/requireOwner.js';
import { usuariosController } from '../controllers/usuarios.controller.js';

const router = Router();

// Todas estas rutas son solo para el dueño de la app
router.use(requireAuth, requireOwner);

router.get('/users', asyncHandler(usuariosController.list));
router.post('/users', asyncHandler(usuariosController.create));

export default router;
