import { parcelasService } from '../services/parcelas.service.js';

export const parcelasController = {
  async list(req, res) {
    const userId = req.user.id;
    const data = await parcelasService.list(userId);
    res.status(200).json({ data });
  },
  async create(req, res) {
    const userId = req.user.id;
    const created = await parcelasService.create(userId, req.body);
    res.status(201).json({ data: created });
  },
  async getById(req, res) {
    const userId = req.user.id;
    const item = await parcelasService.getById(userId, req.params.id);
    if (!item) return res.status(404).json({ error: 'Parcela no encontrada' });
    res.status(200).json({ data: item });
  },
  async update(req, res) {
    const userId = req.user.id;
    const updated = await parcelasService.update(userId, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Parcela no encontrada' });
    res.status(200).json({ data: updated });
  },
  async remove(req, res) {
    const userId = req.user.id;
    const removed = await parcelasService.remove(userId, req.params.id);
    if (!removed) return res.status(404).json({ error: 'Parcela no encontrada' });
    res.status(204).send();
  },
};
