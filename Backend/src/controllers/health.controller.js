export const healthController = {
  status: (_req, res) => {
    res.status(200).json({
      status: 'ok',
      env: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  },
};
