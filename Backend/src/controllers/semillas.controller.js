import { semillasService } from '../services/semillas.service.js';

export const semillasController = {
  async list(req, res) {
    const userId = req.user.id;
    const data = await semillasService.list(userId);
    res.status(200).json({ data });
  },

  async create(req, res) {
    const userId = req.user.id;
    const created = await semillasService.create(userId, req.body);
    res.status(201).json({ data: created });
  },

  async update(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const updated = await semillasService.update(userId, id, req.body);
    if (!updated) return res.status(404).json({ error: 'Semilla no encontrada' });
    res.status(200).json({ data: updated });
  },

  async remove(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const removed = await semillasService.remove(userId, id);
    if (!removed) return res.status(404).json({ error: 'Semilla no encontrada' });
    res.status(204).send();
  },
};
