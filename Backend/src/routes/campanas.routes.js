import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import requireAuth from '../middleware/requireAuth.js';
import { campanasController } from '../controllers/campanas.controller.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(campanasController.list));
router.get('/:id', requireAuth, asyncHandler(campanasController.getOne));
router.post('/', requireAuth, asyncHandler(campanasController.create));
router.put('/:id', requireAuth, asyncHandler(campanasController.update));
router.delete('/:id', requireAuth, asyncHandler(campanasController.remove));

router.get('/:id/diario', requireAuth, asyncHandler(campanasController.listDiario));
router.post('/:id/diario', requireAuth, asyncHandler(campanasController.createDiario));
router.put('/:id/diario/:entryId', requireAuth, asyncHandler(campanasController.updateDiario));
router.delete('/:id/diario/:entryId', requireAuth, asyncHandler(campanasController.removeDiario));

router.get('/:id/remisiones', requireAuth, asyncHandler(campanasController.listRemisiones));
router.post('/:id/remisiones', requireAuth, asyncHandler(campanasController.createRemision));
router.put('/:id/remisiones/:remisionId', requireAuth, asyncHandler(campanasController.updateRemision));
router.delete('/:id/remisiones/:remisionId', requireAuth, asyncHandler(campanasController.removeRemision));

export default router;
