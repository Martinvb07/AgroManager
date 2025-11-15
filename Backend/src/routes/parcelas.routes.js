import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { parcelasController } from '../controllers/parcelas.controller.js';

const router = Router();

router.get('/', asyncHandler(parcelasController.list));
router.post('/', asyncHandler(parcelasController.create));
router.get('/:id', asyncHandler(parcelasController.getById));
router.put('/:id', asyncHandler(parcelasController.update));
router.delete('/:id', asyncHandler(parcelasController.remove));

export default router;
