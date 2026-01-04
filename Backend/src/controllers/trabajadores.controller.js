import { trabajadoresService } from '../services/trabajadores.service.js';

export const trabajadoresController = {
  async list(req, res) {
    const userId = req.user.id;
    const data = await trabajadoresService.list(userId);
    res.status(200).json({ data });
  },

  async create(req, res) {
    const userId = req.user.id;
    const created = await trabajadoresService.create(userId, req.body);
    res.status(201).json({ data: created });
  },

  async update(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const updated = await trabajadoresService.update(userId, id, req.body);
    if (!updated) return res.status(404).json({ error: 'Trabajador no encontrado' });
    res.status(200).json({ data: updated });
  },

  async remove(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const removed = await trabajadoresService.remove(userId, id);
    if (!removed) return res.status(404).json({ error: 'Trabajador no encontrado' });
    res.status(204).send();
  },
};
