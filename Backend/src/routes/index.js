import { Router } from 'express';
import healthRoutes from './health.routes.js';
import parcelasRoutes from './parcelas.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/parcelas', parcelasRoutes);
router.use('/auth', authRoutes);

export default router;
