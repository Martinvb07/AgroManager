import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import requireAuth from '../middleware/requireAuth.js';
import { finanzasController } from '../controllers/finanzas.controller.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(finanzasController.list));
router.post('/ingresos', requireAuth, asyncHandler(finanzasController.createIngreso));
router.post('/egresos', requireAuth, asyncHandler(finanzasController.createEgreso));

export default router;
