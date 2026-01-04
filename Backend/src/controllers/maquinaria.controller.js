import { maquinariaService } from '../services/maquinaria.service.js';

export const maquinariaController = {
  async list(req, res) {
    const userId = req.user.id;
    const data = await maquinariaService.list(userId);
    res.status(200).json({ data });
  },

  async create(req, res) {
    const userId = req.user.id;
    const created = await maquinariaService.create(userId, req.body);
    res.status(201).json({ data: created });
  },

  async update(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const updated = await maquinariaService.update(userId, id, req.body);
    if (!updated) return res.status(404).json({ error: 'Maquinaria no encontrada' });
    res.status(200).json({ data: updated });
  },

  async remove(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const removed = await maquinariaService.remove(userId, id);
    if (!removed) return res.status(404).json({ error: 'Maquinaria no encontrada' });
    res.status(204).send();
  },
};
