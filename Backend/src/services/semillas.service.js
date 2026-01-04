import { getPool } from '../config/db.js';

export const semillasService = {
  async list(userId) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, tipo, cantidad, proveedor, costo FROM semillas WHERE usuario_id = ? ORDER BY id DESC',
      [userId]
    );
    return rows;
  },

  async create(userId, payload) {
    const pool = getPool();
    const {
      tipo = null,
      cantidad = null,
      proveedor = null,
      costo = 0,
    } = payload || {};

    const [result] = await pool.query(
      'INSERT INTO semillas (tipo, cantidad, proveedor, costo, usuario_id) VALUES (?,?,?,?,?)',
      [tipo, cantidad, proveedor, costo, userId]
    );

    const id = result.insertId;
    const [rows] = await pool.query(
      'SELECT id, tipo, cantidad, proveedor, costo FROM semillas WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );
    return rows[0];
  },

  async update(userId, id, changes) {
    const pool = getPool();
    const fields = [];
    const values = [];
    const map = {
      tipo: 'tipo',
      cantidad: 'cantidad',
      proveedor: 'proveedor',
      costo: 'costo',
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
      `UPDATE semillas SET ${fields.join(', ')} WHERE usuario_id = ? AND id = ?`,
      values
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, tipo, cantidad, proveedor, costo FROM semillas WHERE usuario_id = ? AND id = ?',
      [userId, id]
    );
    return rows[0] || null;
  },

  async remove(userId, id) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM semillas WHERE usuario_id = ? AND id = ?',
      [userId, id]
    );
    return result.affectedRows > 0;
  },
};
