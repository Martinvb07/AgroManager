import { getPool } from '../config/db.js';

export async function listCambios(limit) {
  const pool = await getPool();

  let sql = `
    SELECT c.id, c.titulo, c.descripcion, c.created_at, u.nombre AS creado_por
    FROM cambios c
    LEFT JOIN usuarios u ON c.creado_por = u.id
    ORDER BY c.created_at DESC
  `;

  const params = [];
  if (Number.isFinite(limit) && limit > 0) {
    sql += ' LIMIT ?';
    params.push(limit);
  }

  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function createCambio({ titulo, descripcion, userId }) {
  const pool = await getPool();

  const [result] = await pool.query(
    'INSERT INTO cambios (titulo, descripcion, creado_por) VALUES (?, ?, ?)',
    [titulo, descripcion, userId || null]
  );

  const [rows] = await pool.query(
    `SELECT c.id, c.titulo, c.descripcion, c.created_at, u.nombre AS creado_por
     FROM cambios c
     LEFT JOIN usuarios u ON c.creado_por = u.id
     WHERE c.id = ?`,
    [result.insertId]
  );

  return rows[0];
}
