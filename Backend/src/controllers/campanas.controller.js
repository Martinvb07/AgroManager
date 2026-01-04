import { campanasService } from '../services/campanas.service.js';

export const campanasController = {
  async getOne(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const data = await campanasService.getById(userId, id);
    if (!data) return res.status(404).json({ error: 'Campaña no encontrada' });
    res.status(200).json({ data });
  },

  async list(req, res) {
    const userId = req.user.id;
    const data = await campanasService.list(userId);
    res.status(200).json({ data });
  },

  async create(req, res) {
    const userId = req.user.id;
    const created = await campanasService.create(userId, req.body);
    res.status(201).json({ data: created });
  },

  async update(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const updated = await campanasService.update(userId, id, req.body);
    if (!updated) return res.status(404).json({ error: 'Campaña no encontrada' });
    res.status(200).json({ data: updated });
  },

  async remove(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const removed = await campanasService.remove(userId, id);
    if (!removed) return res.status(404).json({ error: 'Campaña no encontrada' });
    res.status(204).send();
  },

  async listDiario(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const { desde, hasta } = req.query || {};
    const data = await campanasService.listDiario(userId, id, { desde, hasta });
    res.status(200).json({ data });
  },

  async createDiario(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const created = await campanasService.createDiario(userId, id, req.body);
    res.status(201).json({ data: created });
  },

  async updateDiario(req, res) {
    const userId = req.user.id;
    const { id, entryId } = req.params;
    const updated = await campanasService.updateDiario(userId, id, entryId, req.body);
    if (!updated) return res.status(404).json({ error: 'Registro diario no encontrado' });
    res.status(200).json({ data: updated });
  },

  async removeDiario(req, res) {
    const userId = req.user.id;
    const { id, entryId } = req.params;
    const removed = await campanasService.removeDiario(userId, id, entryId);
    if (!removed) return res.status(404).json({ error: 'Registro diario no encontrado' });
    res.status(204).send();
  },

  async listRemisiones(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const data = await campanasService.listRemisiones(userId, id);
    res.status(200).json({ data });
  },

  async createRemision(req, res) {
    const userId = req.user.id;
    const { id } = req.params;
    const created = await campanasService.createRemision(userId, id, req.body);
    res.status(201).json({ data: created });
  },

  async updateRemision(req, res) {
    const userId = req.user.id;
    const { id, remisionId } = req.params;
    const updated = await campanasService.updateRemision(userId, id, remisionId, req.body);
    if (!updated) return res.status(404).json({ error: 'Remisión no encontrada' });
    res.status(200).json({ data: updated });
  },

  async removeRemision(req, res) {
    const userId = req.user.id;
    const { id, remisionId } = req.params;
    const removed = await campanasService.removeRemision(userId, id, remisionId);
    if (!removed) return res.status(404).json({ error: 'Remisión no encontrada' });
    res.status(204).send();
  },
};
