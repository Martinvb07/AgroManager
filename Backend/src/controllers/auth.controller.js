import { authService } from '../services/auth.service.js';

export const authController = {
  async login(req, res) {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const user = await authService.loginWithEmailPassword(email, password);

    res.status(200).json({ data: user });
  },
};
