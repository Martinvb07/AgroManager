import { Router } from 'express';
import healthRoutes from './health.routes.js';
import parcelasRoutes from './parcelas.routes.js';
import trabajadoresRoutes from './trabajadores.routes.js';
import finanzasRoutes from './finanzas.routes.js';
import maquinariaRoutes from './maquinaria.routes.js';
import semillasRoutes from './semillas.routes.js';
import plagasRoutes from './plagas.routes.js';
import riegoRoutes from './riego.routes.js';
import campanasRoutes from './campanas.routes.js';
import authRoutes from './auth.routes.js';
import ownerRoutes from './owner.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/parcelas', parcelasRoutes);
router.use('/trabajadores', trabajadoresRoutes);
router.use('/finanzas', finanzasRoutes);
router.use('/maquinaria', maquinariaRoutes);
router.use('/semillas', semillasRoutes);
router.use('/plagas', plagasRoutes);
router.use('/riego', riegoRoutes);
router.use('/campanas', campanasRoutes);
router.use('/auth', authRoutes);
router.use('/owner', ownerRoutes);

export default router;
