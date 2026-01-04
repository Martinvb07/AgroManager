import { getPool } from '../config/db.js';

export const riegoService = {
  async list(userId) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT r.id,
              p.nombre AS parcela,
              r.tipo,
              r.consumo_agua,
              r.ultimo_riego,
              r.proximo_riego
         FROM riego r
    LEFT JOIN parcelas p ON r.parcela_id = p.id
        WHERE r.usuario_id = ?
     ORDER BY r.proximo_riego DESC, r.id DESC`,
      [userId]
    );

    return rows.map((row) => ({
      id: row.id,
      parcela: row.parcela || '-',
      tipo: row.tipo,
      consumoAgua: row.consumo_agua,
      ultimoRiego: row.ultimo_riego,
      proximoRiego: row.proximo_riego,
    }));
  },

  async create(userId, payload) {
    const pool = getPool();
    const {
      // opcionalmente podríamos aceptar parcelaId en el futuro
      tipo = null,
      consumoAgua = null,
      ultimoRiego = null,
      proximoRiego = null,
    } = payload || {};

    const [result] = await pool.query(
      'INSERT INTO riego (tipo, consumo_agua, ultimo_riego, proximo_riego, usuario_id) VALUES (?,?,?,?,?)',
      [tipo, consumoAgua, ultimoRiego || null, proximoRiego || null, userId]
    );

    const id = result.insertId;
    return this.getById(userId, id);
  },

  async update(userId, id, changes) {
    const pool = getPool();
    const fields = [];
    const values = [];

    const map = {
      tipo: 'tipo',
      consumoAgua: 'consumo_agua',
      ultimoRiego: 'ultimo_riego',
      proximoRiego: 'proximo_riego',
    };

    for (const [key, column] of Object.entries(map)) {
      if (key in changes) {
        fields.push(`${column} = ?`);
        values.push(changes[key] || null);
      }
    }

    if (!fields.length) return this.getById(userId, id);

    values.push(userId, id);
    await pool.query(
      `UPDATE riego SET ${fields.join(', ')} WHERE usuario_id = ? AND id = ?`,
      values
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT r.id,
              p.nombre AS parcela,
              r.tipo,
              r.consumo_agua,
              r.ultimo_riego,
              r.proximo_riego
         FROM riego r
    LEFT JOIN parcelas p ON r.parcela_id = p.id
        WHERE r.usuario_id = ? AND r.id = ?`,
      [userId, id]
    );

    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      parcela: row.parcela || '-',
      tipo: row.tipo,
      consumoAgua: row.consumo_agua,
      ultimoRiego: row.ultimo_riego,
      proximoRiego: row.proximo_riego,
    };
  },

  async remove(userId, id) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM riego WHERE usuario_id = ? AND id = ?',
      [userId, id]
    );
    return result.affectedRows > 0;
  },
};
