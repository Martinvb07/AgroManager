import bcrypt from 'bcryptjs';
import { getPool } from '../config/db.js';

export const usuariosService = {
  async listUsers() {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, nombre, email, rol, estado, created_at FROM usuarios ORDER BY id DESC'
    );
    return rows;
  },

  async createUser({ nombre, email, password, rol = 'admin' }) {
    const pool = getPool();

    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [email]);
    if (existing[0]) {
      const err = new Error('Ya existe un usuario con ese correo');
      err.status = 400;
      throw err;
    }

    // Si el valor ya parece un hash bcrypt (empieza con $2a$, $2b$ o $2y$),
    // lo usamos directo. Si no, asumimos contraseña en texto plano y la hasheamos.
    let passwordHash = password;
    const bcryptPrefix = /^
      \$2[aby]\$          # prefijo bcrypt
    /x;

    if (!bcryptPrefix.test(password || '')) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol, estado, created_at) VALUES (?, ?, ?, ?, \'Activo\', NOW())',
      [nombre, email, passwordHash, rol]
    );

    return {
      id: result.insertId,
      nombre,
      email,
      rol,
      estado: 'Activo',
      created_at: new Date(),
    };
  },
};
