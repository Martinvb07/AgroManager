import { getPool } from '../config/db.js';

export const parcelasService = {
  async list(userId) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, nombre, hectareas, cultivo, estado, inversion FROM parcelas WHERE usuario_id = ? ORDER BY id DESC',
      [userId]
    );
    return rows;
  },
  async create(userId, payload) {
    const pool = getPool();
    const {
      nombre = null,
      hectareas = null,
      cultivo = null,
      estado = 'Activa',
      inversion = 0,
    } = payload || {};
    const [result] = await pool.query(
      'INSERT INTO parcelas (nombre, hectareas, cultivo, estado, inversion, usuario_id) VALUES (?,?,?,?,?,?)',
      [nombre, hectareas, cultivo, estado, inversion, userId]
    );
    const id = result.insertId;
    const [rows] = await pool.query(
      'SELECT id, nombre, hectareas, cultivo, estado, inversion FROM parcelas WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );
    return rows[0];
  },
  async getById(userId, id) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, nombre, hectareas, cultivo, estado, inversion FROM parcelas WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );
    return rows[0] || null;
  },
  async update(userId, id, changes) {
    const pool = getPool();
    // Build dynamic update
    const fields = [];
    const values = [];
    const allowed = ['nombre', 'hectareas', 'cultivo', 'estado', 'inversion'];
    for (const key of allowed) {
      if (key in changes) {
        fields.push(`${key} = ?`);
        values.push(changes[key]);
      }
    }
    if (!fields.length) return this.getById(userId, id);
    values.push(userId, id);
    await pool.query(
      `UPDATE parcelas SET ${fields.join(', ')} WHERE usuario_id = ? AND id = ?`,
      values
    );
    return this.getById(userId, id);
  },
  async remove(userId, id) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM parcelas WHERE usuario_id = ? AND id = ?',
      [userId, id]
    );
    return result.affectedRows > 0;
  },
};
