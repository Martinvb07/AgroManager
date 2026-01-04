import { riegoService } from '../services/riego.service.js';

export const riegoController = {
  async list(req, res) {
    const userId = req.user.id;
    const data = await riegoService.list(userId);
    res.status(200).json({ data });
  },

  async create(req, res) {
    const userId = req.user.id;
    const created = await riegoService.create(userId, req.body);
    res.status(201).json({ data: created });
  },

  async update(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const updated = await riegoService.update(userId, id, req.body);
    if (!updated) return res.status(404).json({ error: 'Programación de riego no encontrada' });
    res.status(200).json({ data: updated });
  },

  async remove(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const removed = await riegoService.remove(userId, id);
    if (!removed) return res.status(404).json({ error: 'Programación de riego no encontrada' });
    res.status(204).send();
  },
};
