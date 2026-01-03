import { testConnection } from '../config/db.js';

export const healthController = {
  status: (_req, res) => {
    res.status(200).json({
      status: 'ok',
      env: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  },
  db: async (_req, res) => {
    try {
      const ok = await testConnection();
      if (ok) {
        return res.status(200).json({ status: 'ok', db: 'connected' });
      }
      return res.status(500).json({ status: 'error', db: 'query-failed' });
    } catch (err) {
      return res.status(500).json({ status: 'error', db: 'unreachable', error: err?.message });
    }
  },
};
