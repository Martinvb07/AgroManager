import bcrypt from 'bcryptjs';
import { getPool } from '../config/db.js';

export const authService = {
  async loginWithEmailPassword(email, password) {
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT id, nombre, email, password_hash, rol, estado FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );

    const user = rows[0];

    if (!user) {
      const err = new Error('Credenciales inválidas');
      err.status = 401;
      throw err;
    }

    if (user.estado !== 'Activo') {
      const err = new Error('Usuario inactivo');
      err.status = 403;
      throw err;
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      const err = new Error('Credenciales inválidas');
      err.status = 401;
      throw err;
    }

    const { password_hash, ...safeUser } = user;
    return safeUser;
  },
};
