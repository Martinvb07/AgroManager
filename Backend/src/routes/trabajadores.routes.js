import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import requireAuth from '../middleware/requireAuth.js';
import { trabajadoresController } from '../controllers/trabajadores.controller.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(trabajadoresController.list));
router.post('/', requireAuth, asyncHandler(trabajadoresController.create));
router.put('/:id', requireAuth, asyncHandler(trabajadoresController.update));
router.delete('/:id', requireAuth, asyncHandler(trabajadoresController.remove));

export default router;
