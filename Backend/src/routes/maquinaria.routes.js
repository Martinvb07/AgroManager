import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import requireAuth from '../middleware/requireAuth.js';
import { maquinariaController } from '../controllers/maquinaria.controller.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(maquinariaController.list));
router.post('/', requireAuth, asyncHandler(maquinariaController.create));
router.put('/:id', requireAuth, asyncHandler(maquinariaController.update));
router.delete('/:id', requireAuth, asyncHandler(maquinariaController.remove));

export default router;
