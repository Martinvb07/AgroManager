import jwt from 'jsonwebtoken';
import { authService } from '../services/auth.service.js';
import { env } from '../config/env.js';

export const authController = {
  async login(req, res) {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const user = await authService.loginWithEmailPassword(email, password);

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({ data: user, token });
  },
};
