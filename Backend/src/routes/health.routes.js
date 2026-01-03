import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';

const router = Router();

router.get('/', healthController.status);
router.get('/db', healthController.db);

export default router;
