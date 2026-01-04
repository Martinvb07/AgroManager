import { getPool } from '../config/db.js';

export const trabajadoresService = {
  async list(userId) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, nombre, cargo, salario, horas_trabajadas AS horasTrabajadas, estado FROM trabajadores WHERE usuario_id = ? ORDER BY id DESC',
      [userId]
    );
    return rows;
  },

  async create(userId, payload) {
    const pool = getPool();
    const {
      nombre = null,
      cargo = null,
      salario = 0,
      horasTrabajadas = 0,
      estado = 'Activo',
    } = payload || {};

    const [result] = await pool.query(
      'INSERT INTO trabajadores (nombre, cargo, salario, horas_trabajadas, estado, usuario_id) VALUES (?,?,?,?,?,?)',
      [nombre, cargo, salario, horasTrabajadas, estado, userId]
    );

    const id = result.insertId;
    const [rows] = await pool.query(
      'SELECT id, nombre, cargo, salario, horas_trabajadas AS horasTrabajadas, estado FROM trabajadores WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );
    return rows[0];
  },

  async update(userId, id, changes) {
    const pool = getPool();
    const fields = [];
    const values = [];
    const mapKeys = {
      nombre: 'nombre',
      cargo: 'cargo',
      salario: 'salario',
      horasTrabajadas: 'horas_trabajadas',
      estado: 'estado',
    };

    for (const [key, column] of Object.entries(mapKeys)) {
      if (key in changes) {
        fields.push(`${column} = ?`);
        values.push(changes[key]);
      }
    }

    if (!fields.length) return this.getById(userId, id);

    values.push(userId, id);
    await pool.query(
      `UPDATE trabajadores SET ${fields.join(', ')} WHERE usuario_id = ? AND id = ?`,
      values
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, nombre, cargo, salario, horas_trabajadas AS horasTrabajadas, estado FROM trabajadores WHERE usuario_id = ? AND id = ?',
      [userId, id]
    );
    return rows[0] || null;
  },

  async remove(userId, id) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM trabajadores WHERE usuario_id = ? AND id = ?',
      [userId, id]
    );
    return result.affectedRows > 0;
  },
};
