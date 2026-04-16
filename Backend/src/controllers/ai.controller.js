import { aiService } from '../services/ai.service.js';

export const aiController = {
  async advice(req, res) {
    const user = req.user;
    const { question = '', context = {} } = req.body || {};

    const data = await aiService.getAdvice({ user, question, context });
    res.status(200).json({ data });
  },

  async chat(req, res) {
    const userId = req.user?.id;
    const { messages = [] } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un mensaje.' });
    }

    const data = await aiService.chat({ userId, messages });
    res.status(200).json({ data });
  },
};
