import { getPool } from '../config/db.js';

export const plagasService = {
  async list(userId) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, cultivo, tipo, severidad, tratamiento, fecha_detec FROM plagas WHERE usuario_id = ? ORDER BY fecha_detec DESC, id DESC',
      [userId]
    );
    return rows.map((row) => ({
      ...row,
      fechaDetec: row.fecha_detec,
    }));
  },

  async create(userId, payload) {
    const pool = getPool();
    const {
      cultivo = null,
      tipo = null,
      severidad = null,
      tratamiento = null,
      fechaDetec = null,
    } = payload || {};

    const [result] = await pool.query(
      'INSERT INTO plagas (cultivo, tipo, severidad, tratamiento, fecha_detec, usuario_id) VALUES (?,?,?,?,?,?)',
      [cultivo, tipo, severidad, tratamiento, fechaDetec, userId]
    );

    const id = result.insertId;
    const [rows] = await pool.query(
      'SELECT id, cultivo, tipo, severidad, tratamiento, fecha_detec FROM plagas WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );
    const row = rows[0];
    return row
      ? {
          ...row,
          fechaDetec: row.fecha_detec,
        }
      : null;
  },

  async update(userId, id, changes) {
    const pool = getPool();
    const fields = [];
    const values = [];

    const map = {
      cultivo: 'cultivo',
      tipo: 'tipo',
      severidad: 'severidad',
      tratamiento: 'tratamiento',
      fechaDetec: 'fecha_detec',
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
      `UPDATE plagas SET ${fields.join(', ')} WHERE usuario_id = ? AND id = ?`,
      values
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, cultivo, tipo, severidad, tratamiento, fecha_detec FROM plagas WHERE usuario_id = ? AND id = ?',
      [userId, id]
    );
    const row = rows[0];
    return row
      ? {
          ...row,
          fechaDetec: row.fecha_detec,
        }
      : null;
  },

  async remove(userId, id) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM plagas WHERE usuario_id = ? AND id = ?',
      [userId, id]
    );
    return result.affectedRows > 0;
  },
};
