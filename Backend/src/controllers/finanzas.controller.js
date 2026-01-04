import { finanzasService } from '../services/finanzas.service.js';

export const finanzasController = {
  async list(req, res) {
    const userId = req.user.id;
    const [ingresos, egresos] = await Promise.all([
      finanzasService.listIngresos(userId),
      finanzasService.listEgresos(userId),
    ]);
    res.status(200).json({ data: { ingresos, egresos } });
  },

  async createIngreso(req, res) {
    const userId = req.user.id;
    const created = await finanzasService.createIngreso(userId, req.body);
    res.status(201).json({ data: created });
  },

  async createEgreso(req, res) {
    const userId = req.user.id;
    const created = await finanzasService.createEgreso(userId, req.body);
    res.status(201).json({ data: created });
  },
};
