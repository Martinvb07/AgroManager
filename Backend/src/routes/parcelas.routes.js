import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { parcelasController } from '../controllers/parcelas.controller.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(parcelasController.list));
router.post('/', requireAuth, asyncHandler(parcelasController.create));
router.get('/:id', requireAuth, asyncHandler(parcelasController.getById));
router.put('/:id', requireAuth, asyncHandler(parcelasController.update));
router.delete('/:id', requireAuth, asyncHandler(parcelasController.remove));

export default router;
