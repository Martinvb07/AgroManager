import { getPool } from '../config/db.js';

export const parcelasService = {
  async list() {
    const pool = getPool();
    const [rows] = await pool.query('SELECT id, nombre, hectareas, cultivo, estado, inversion FROM parcelas ORDER BY id DESC');
    return rows;
  },
  async create(payload) {
    const pool = getPool();
    const {
      nombre = null,
      hectareas = null,
      cultivo = null,
      estado = 'Activa',
      inversion = 0,
    } = payload || {};
    const [result] = await pool.query(
      'INSERT INTO parcelas (nombre, hectareas, cultivo, estado, inversion) VALUES (?,?,?,?,?)',
      [nombre, hectareas, cultivo, estado, inversion]
    );
    const id = result.insertId;
    const [rows] = await pool.query('SELECT id, nombre, hectareas, cultivo, estado, inversion FROM parcelas WHERE id = ?', [id]);
    return rows[0];
  },
  async getById(id) {
    const pool = getPool();
    const [rows] = await pool.query('SELECT id, nombre, hectareas, cultivo, estado, inversion FROM parcelas WHERE id = ?', [id]);
    return rows[0] || null;
  },
  async update(id, changes) {
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
    if (!fields.length) return this.getById(id);
    values.push(id);
    await pool.query(`UPDATE parcelas SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  },
  async remove(id) {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM parcelas WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
