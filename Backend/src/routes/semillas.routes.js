import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import requireAuth from '../middleware/requireAuth.js';
import { semillasController } from '../controllers/semillas.controller.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(semillasController.list));
router.post('/', requireAuth, asyncHandler(semillasController.create));
router.put('/:id', requireAuth, asyncHandler(semillasController.update));
router.delete('/:id', requireAuth, asyncHandler(semillasController.remove));

export default router;
