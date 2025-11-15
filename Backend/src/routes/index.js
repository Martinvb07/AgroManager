import { Router } from 'express';
import healthRoutes from './health.routes.js';
import parcelasRoutes from './parcelas.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/parcelas', parcelasRoutes);

export default router;
