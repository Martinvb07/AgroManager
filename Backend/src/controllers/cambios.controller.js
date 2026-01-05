import asyncHandler from '../middleware/asyncHandler.js';
import { listCambios, createCambio } from '../services/cambios.service.js';

export const cambiosController = {
  list: asyncHandler(async (req, res) => {
    const limitParam = req.query.limit;
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

    const cambios = await listCambios(Number.isNaN(limit) ? undefined : limit);
    res.json({ data: cambios });
  }),

  create: asyncHandler(async (req, res) => {
    const { titulo, descripcion } = req.body || {};

    if (!titulo || !descripcion) {
      return res.status(400).json({ message: 'titulo y descripcion son obligatorios' });
    }

    const user = req.user || {};
    const rol = (user.rol || '').toString().toLowerCase();

    // Solo el dueño (owner) puede registrar cambios que se muestran en la landing
    if (rol !== 'owner') {
      return res.status(403).json({ message: 'Solo el dueño puede registrar cambios' });
    }

    const nuevoCambio = await createCambio({
      titulo: titulo.toString().trim(),
      descripcion: descripcion.toString().trim(),
      userId: user.id,
    });

    res.status(201).json({ data: nuevoCambio });
  }),
};
