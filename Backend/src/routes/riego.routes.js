import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import requireAuth from '../middleware/requireAuth.js';
import { riegoController } from '../controllers/riego.controller.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(riegoController.list));
router.post('/', requireAuth, asyncHandler(riegoController.create));
router.put('/:id', requireAuth, asyncHandler(riegoController.update));
router.delete('/:id', requireAuth, asyncHandler(riegoController.remove));

export default router;
