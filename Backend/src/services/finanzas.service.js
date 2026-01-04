import { getPool } from '../config/db.js';

export const finanzasService = {
  async listIngresos(userId) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, concepto, monto, fecha, tipo, parcela_id AS parcelaId FROM ingresos WHERE usuario_id = ? ORDER BY fecha DESC, id DESC',
      [userId]
    );
    return rows;
  },

  async listEgresos(userId) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, concepto, monto, fecha, tipo, categoria FROM egresos WHERE usuario_id = ? ORDER BY fecha DESC, id DESC',
      [userId]
    );
    return rows;
  },

  async createIngreso(userId, payload) {
    const pool = getPool();
    const {
      concepto = null,
      monto = 0,
      fecha = null,
      tipo = null,
      parcelaId = null,
    } = payload || {};

    const [result] = await pool.query(
      'INSERT INTO ingresos (concepto, monto, fecha, tipo, parcela_id, usuario_id) VALUES (?,?,?,?,?,?)',
      [concepto, monto, fecha, tipo, parcelaId, userId]
    );

    const id = result.insertId;
    const [rows] = await pool.query(
      'SELECT id, concepto, monto, fecha, tipo, parcela_id AS parcelaId FROM ingresos WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );
    return rows[0];
  },

  async createEgreso(userId, payload) {
    const pool = getPool();
    const {
      concepto = null,
      monto = 0,
      fecha = null,
      tipo = null,
      categoria = null,
    } = payload || {};

    const [result] = await pool.query(
      'INSERT INTO egresos (concepto, monto, fecha, tipo, categoria, usuario_id) VALUES (?,?,?,?,?,?)',
      [concepto, monto, fecha, tipo, categoria, userId]
    );

    const id = result.insertId;
    const [rows] = await pool.query(
      'SELECT id, concepto, monto, fecha, tipo, categoria FROM egresos WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );
    return rows[0];
  },
};
