import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import requireAuth from '../middleware/requireAuth.js';
import { plagasController } from '../controllers/plagas.controller.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(plagasController.list));
router.post('/', requireAuth, asyncHandler(plagasController.create));
router.put('/:id', requireAuth, asyncHandler(plagasController.update));
router.delete('/:id', requireAuth, asyncHandler(plagasController.remove));

export default router;
