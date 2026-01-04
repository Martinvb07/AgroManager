import { getPool } from '../config/db.js';

export const maquinariaService = {
  async list(userId) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, nombre, tipo, estado, ultimo_mantenimiento AS ultimoMantenimiento, proximo_mantenimiento AS proximoMantenimiento FROM maquinaria WHERE usuario_id = ? ORDER BY id DESC',
      [userId]
    );
    return rows;
  },

  async create(userId, payload) {
    const pool = getPool();
    const {
      nombre = null,
      tipo = null,
      estado = 'Operativo',
      ultimoMantenimiento = null,
      proximoMantenimiento = null,
    } = payload || {};

    const [result] = await pool.query(
      'INSERT INTO maquinaria (nombre, tipo, estado, ultimo_mantenimiento, proximo_mantenimiento, usuario_id) VALUES (?,?,?,?,?,?)',
      [nombre, tipo, estado, ultimoMantenimiento, proximoMantenimiento, userId]
    );

    const id = result.insertId;
    const [rows] = await pool.query(
      'SELECT id, nombre, tipo, estado, ultimo_mantenimiento AS ultimoMantenimiento, proximo_mantenimiento AS proximoMantenimiento FROM maquinaria WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );
    return rows[0];
  },

  async update(userId, id, changes) {
    const pool = getPool();
    const fields = [];
    const values = [];
    const map = {
      nombre: 'nombre',
      tipo: 'tipo',
      estado: 'estado',
      ultimoMantenimiento: 'ultimo_mantenimiento',
      proximoMantenimiento: 'proximo_mantenimiento',
    };

    for (const [key, column] of Object.entries(map)) {
      if (key in changes) {
        fields.push(`${column} = ?`);
        values.push(changes[key]);
      }
    }

    if (!fields.length) return this.getById(userId, id);

    values.push(userId, id);
    await pool.query(
      `UPDATE maquinaria SET ${fields.join(', ')} WHERE usuario_id = ? AND id = ?`,
      values
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, nombre, tipo, estado, ultimo_mantenimiento AS ultimoMantenimiento, proximo_mantenimiento AS proximoMantenimiento FROM maquinaria WHERE usuario_id = ? AND id = ?',
      [userId, id]
    );
    return rows[0] || null;
  },

  async remove(userId, id) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM maquinaria WHERE usuario_id = ? AND id = ?',
      [userId, id]
    );
    return result.affectedRows > 0;
  },
};
