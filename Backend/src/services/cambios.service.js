import { getPool } from '../config/db.js';

export async function listCambios(limit) {
  const pool = await getPool();

  const params = [];
  const withTipo = `
    SELECT c.id, c.titulo, c.descripcion, c.tipo, c.created_at, u.nombre AS creado_por
    FROM cambios c
    LEFT JOIN usuarios u ON c.creado_por = u.id
    ORDER BY c.created_at DESC
  `;

  const withoutTipo = `
    SELECT c.id, c.titulo, c.descripcion, c.created_at, u.nombre AS creado_por
    FROM cambios c
    LEFT JOIN usuarios u ON c.creado_por = u.id
    ORDER BY c.created_at DESC
  `;

  const applyLimit = (sql) => {
    if (Number.isFinite(limit) && limit > 0) {
      params.push(limit);
      return `${sql} LIMIT ?`;
    }
    return sql;
  };

  try {
    const [rows] = await pool.query(applyLimit(withTipo), params);
    return rows;
  } catch (e) {
    // Compatibilidad con BD antigua sin columna `tipo`
    if (e && (e.code === 'ER_BAD_FIELD_ERROR' || /Unknown column/i.test(e.message || ''))) {
      const [rows] = await pool.query(applyLimit(withoutTipo), params);
      return rows;
    }
    throw e;
  }
}

export async function createCambio({ titulo, descripcion, tipo, userId }) {
  const pool = await getPool();

  let result;
  try {
    const [r] = await pool.query(
      'INSERT INTO cambios (titulo, descripcion, tipo, creado_por) VALUES (?, ?, ?, ?)',
      [titulo, descripcion, (tipo || 'novedad').toString().trim(), userId || null]
    );
    result = r;
  } catch (e) {
    // Compatibilidad con BD antigua sin columna `tipo`
    if (e && (e.code === 'ER_BAD_FIELD_ERROR' || /Unknown column/i.test(e.message || ''))) {
      const [r] = await pool.query(
        'INSERT INTO cambios (titulo, descripcion, creado_por) VALUES (?, ?, ?)',
        [titulo, descripcion, userId || null]
      );
      result = r;
    } else {
      throw e;
    }
  }


  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.titulo, c.descripcion, c.tipo, c.created_at, u.nombre AS creado_por
       FROM cambios c
       LEFT JOIN usuarios u ON c.creado_por = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );
    return rows[0];
  } catch (e) {
    if (e && (e.code === 'ER_BAD_FIELD_ERROR' || /Unknown column/i.test(e.message || ''))) {
      const [rows] = await pool.query(
        `SELECT c.id, c.titulo, c.descripcion, c.created_at, u.nombre AS creado_por
         FROM cambios c
         LEFT JOIN usuarios u ON c.creado_por = u.id
         WHERE c.id = ?`,
        [result.insertId]
      );
      // si no hay tipo en BD, devolvemos uno por defecto para el frontend
      return { ...rows[0], tipo: (tipo || 'novedad').toString().trim() };
    }
    throw e;
  }
}
