import { Router } from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { authController } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', asyncHandler(authController.login));

export default router;
