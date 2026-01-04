import { plagasService } from '../services/plagas.service.js';

export const plagasController = {
  async list(req, res) {
    const userId = req.user.id;
    const data = await plagasService.list(userId);
    res.status(200).json({ data });
  },

  async create(req, res) {
    const userId = req.user.id;
    const created = await plagasService.create(userId, req.body);
    res.status(201).json({ data: created });
  },

  async update(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const updated = await plagasService.update(userId, id, req.body);
    if (!updated) return res.status(404).json({ error: 'Registro de plaga no encontrado' });
    res.status(200).json({ data: updated });
  },

  async remove(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const removed = await plagasService.remove(userId, id);
    if (!removed) return res.status(404).json({ error: 'Registro de plaga no encontrado' });
    res.status(204).send();
  },
};
