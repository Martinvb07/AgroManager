import { aiService } from '../services/ai.service.js';

export const aiController = {
  async advice(req, res) {
    const user = req.user;
    const { question = '', context = {} } = req.body || {};

    const data = await aiService.getAdvice({ user, question, context });
    res.status(200).json({ data });
  },
};
