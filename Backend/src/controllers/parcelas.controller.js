import { parcelasService } from '../services/parcelas.service.js';

export const parcelasController = {
  async list(_req, res) {
    const data = await parcelasService.list();
    res.status(200).json({ data });
  },
  async create(req, res) {
    const created = await parcelasService.create(req.body);
    res.status(201).json({ data: created });
  },
  async getById(req, res) {
    const item = await parcelasService.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Parcela no encontrada' });
    res.status(200).json({ data: item });
  },
  async update(req, res) {
    const updated = await parcelasService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Parcela no encontrada' });
    res.status(200).json({ data: updated });
  },
  async remove(req, res) {
    const removed = await parcelasService.remove(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Parcela no encontrada' });
    res.status(204).send();
  },
};
