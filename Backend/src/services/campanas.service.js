import { getPool } from '../config/db.js';

export const campanasService = {
  async list(userId) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id,
              nombre,
              fecha_inicio,
              fecha_fin,
              hectareas,
              lotes,
              inversion_total,
              gastos_operativos,
              ingreso_total,
              rendimiento_ha,
              produccion_total
         FROM campanas
        WHERE usuario_id = ?
     ORDER BY fecha_inicio DESC, id DESC`,
      [userId]
    );

    return rows.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      fechaInicio: row.fecha_inicio,
      fechaFin: row.fecha_fin,
      hectareas: row.hectareas,
      lotes: row.lotes,
      inversionTotal: row.inversion_total,
      gastosOperativos: row.gastos_operativos,
      ingresoTotal: row.ingreso_total,
      rendimientoHa: row.rendimiento_ha,
      produccionTotal: row.produccion_total,
    }));
  },

  async create(userId, payload) {
    const pool = getPool();
    const {
      nombre = null,
      fechaInicio = null,
      fechaFin = null,
      hectareas = null,
      lotes = null,
      inversionTotal = 0,
      gastosOperativos = 0,
      ingresoTotal = 0,
      rendimientoHa = null,
      produccionTotal = null,
    } = payload || {};

    const [result] = await pool.query(
      `INSERT INTO campanas
         (nombre, fecha_inicio, fecha_fin, hectareas, lotes, inversion_total, gastos_operativos, ingreso_total, rendimiento_ha, produccion_total, usuario_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        nombre,
        fechaInicio,
        fechaFin,
        hectareas,
        lotes,
        inversionTotal,
        gastosOperativos,
        ingresoTotal,
        rendimientoHa,
        produccionTotal,
        userId,
      ]
    );

    const id = result.insertId;
    return this.getById(userId, id);
  },

  async update(userId, id, changes) {
    const pool = getPool();
    const fields = [];
    const values = [];

    const map = {
      nombre: 'nombre',
      fechaInicio: 'fecha_inicio',
      fechaFin: 'fecha_fin',
      hectareas: 'hectareas',
      lotes: 'lotes',
      inversionTotal: 'inversion_total',
      gastosOperativos: 'gastos_operativos',
      ingresoTotal: 'ingreso_total',
      rendimientoHa: 'rendimiento_ha',
      produccionTotal: 'produccion_total',
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
      `UPDATE campanas SET ${fields.join(', ')} WHERE usuario_id = ? AND id = ?`,
      values
    );

    return this.getById(userId, id);
  },

  async getById(userId, id) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id,
              nombre,
              fecha_inicio,
              fecha_fin,
              hectareas,
              lotes,
              inversion_total,
              gastos_operativos,
              ingreso_total,
              rendimiento_ha,
              produccion_total
         FROM campanas
        WHERE usuario_id = ? AND id = ?`,
      [userId, id]
    );

    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      nombre: row.nombre,
      fechaInicio: row.fecha_inicio,
      fechaFin: row.fecha_fin,
      hectareas: row.hectareas,
      lotes: row.lotes,
      inversionTotal: row.inversion_total,
      gastosOperativos: row.gastos_operativos,
      ingresoTotal: row.ingreso_total,
      rendimientoHa: row.rendimiento_ha,
      produccionTotal: row.produccion_total,
    };
  },

  async remove(userId, id) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM campanas WHERE usuario_id = ? AND id = ?',
      [userId, id]
    );
    return result.affectedRows > 0;
  },

  async listDiario(userId, campanaId, filters = {}) {
    const pool = getPool();
    const { desde, hasta } = filters || {};

    let sql = `SELECT id,
                      fecha,
                      hectareas_cortadas,
                      bultos,
                      notas
                 FROM campanas_diario
                WHERE usuario_id = ? AND campana_id = ?`;

    const params = [userId, campanaId];

    if (desde) {
      sql += ' AND fecha >= ?';
      params.push(desde);
    }

    if (hasta) {
      sql += ' AND fecha <= ?';
      params.push(hasta);
    }

    sql += ' ORDER BY fecha ASC, id ASC';

    const [rows] = await pool.query(sql, params);

    return rows.map((row) => ({
      id: row.id,
      fecha: row.fecha,
      hectareas: row.hectareas_cortadas,
      bultos: row.bultos,
      notas: row.notas,
    }));
  },

  async createDiario(userId, campanaId, payload) {
    const pool = getPool();
    const {
      fecha = null,
      hectareas = null,
      bultos = null,
      notas = null,
    } = payload || {};

    const [result] = await pool.query(
      `INSERT INTO campanas_diario (campana_id, fecha, hectareas_cortadas, bultos, notas, usuario_id)
       VALUES (?,?,?,?,?,?)`,
      [campanaId, fecha, hectareas, bultos, notas, userId]
    );

    const id = result.insertId;
    return this.getDiarioById(userId, campanaId, id);
  },

  async updateDiario(userId, campanaId, entryId, changes) {
    const pool = getPool();
    const fields = [];
    const values = [];

    const map = {
      fecha: 'fecha',
      hectareas: 'hectareas_cortadas',
      bultos: 'bultos',
      notas: 'notas',
    };

    for (const [key, column] of Object.entries(map)) {
      if (key in changes) {
        fields.push(`${column} = ?`);
        values.push(changes[key]);
      }
    }

    if (!fields.length) return this.getDiarioById(userId, campanaId, entryId);

    values.push(userId, campanaId, entryId);
    await pool.query(
      `UPDATE campanas_diario SET ${fields.join(', ')} WHERE usuario_id = ? AND campana_id = ? AND id = ?`,
      values
    );

    return this.getDiarioById(userId, campanaId, entryId);
  },

  async getDiarioById(userId, campanaId, entryId) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id,
              fecha,
              hectareas_cortadas,
              bultos,
              notas
         FROM campanas_diario
        WHERE usuario_id = ? AND campana_id = ? AND id = ?`,
      [userId, campanaId, entryId]
    );

    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      fecha: row.fecha,
      hectareas: row.hectareas_cortadas,
      bultos: row.bultos,
      notas: row.notas,
    };
  },

  async removeDiario(userId, campanaId, entryId) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM campanas_diario WHERE usuario_id = ? AND campana_id = ? AND id = ?',
      [userId, campanaId, entryId]
    );
    return result.affectedRows > 0;
  },

  async listRemisiones(userId, campanaId) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id,
              fecha,
              nombre_conductor,
              cc_conductor,
              vehiculo_placa,
              origen,
              cantidad,
              variedad,
              enviado_por,
              enviado_cc,
              valor_flete,
              firma_conductor,
              firma_propietario,
              nota
         FROM remisiones
        WHERE usuario_id = ? AND campana_id = ?
     ORDER BY fecha DESC, id DESC`,
      [userId, campanaId]
    );

    return rows.map((row) => ({
      id: row.id,
      fecha: row.fecha,
      nombreConductor: row.nombre_conductor,
      ccConductor: row.cc_conductor,
      vehiculoPlaca: row.vehiculo_placa,
      origen: row.origen,
      cantidad: row.cantidad,
      variedad: row.variedad,
      enviadoPor: row.enviado_por,
      enviadoCc: row.enviado_cc,
      valorFlete: row.valor_flete,
      firmaConductor: row.firma_conductor,
      firmaPropietario: row.firma_propietario,
      nota: row.nota,
    }));
  },

  async createRemision(userId, campanaId, payload) {
    const pool = getPool();
    const {
      fecha = null,
      nombreConductor = null,
      ccConductor = null,
      vehiculoPlaca = null,
      origen = null,
      cantidad = null,
      variedad = null,
      enviadoPor = null,
      enviadoCc = null,
      valorFlete = null,
      firmaConductor = null,
      firmaPropietario = null,
      nota = null,
    } = payload || {};

    const [result] = await pool.query(
      `INSERT INTO remisiones (
         campana_id, fecha, nombre_conductor, cc_conductor, vehiculo_placa,
         origen, cantidad, variedad, valor_flete,
         enviado_por, enviado_cc, firma_conductor, firma_propietario, nota, usuario_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        campanaId,
        fecha,
        nombreConductor,
        ccConductor,
        vehiculoPlaca,
        origen,
        cantidad,
        variedad,
        valorFlete,
        enviadoPor,
        enviadoCc,
        firmaConductor,
        firmaPropietario,
        nota,
        userId,
      ]
    );

    const id = result.insertId;
    return this.getRemisionById(userId, campanaId, id);
  },

  async updateRemision(userId, campanaId, remisionId, changes) {
    const pool = getPool();
    const fields = [];
    const values = [];

    const map = {
      fecha: 'fecha',
      nombreConductor: 'nombre_conductor',
      ccConductor: 'cc_conductor',
      vehiculoPlaca: 'vehiculo_placa',
      origen: 'origen',
      cantidad: 'cantidad',
      variedad: 'variedad',
      enviadoPor: 'enviado_por',
      enviadoCc: 'enviado_cc',
      valorFlete: 'valor_flete',
      firmaConductor: 'firma_conductor',
      firmaPropietario: 'firma_propietario',
      nota: 'nota',
    };

    for (const [key, column] of Object.entries(map)) {
      if (key in changes) {
        fields.push(`${column} = ?`);
        values.push(changes[key]);
      }
    }

    if (!fields.length) return this.getRemisionById(userId, campanaId, remisionId);

    values.push(userId, campanaId, remisionId);
    await pool.query(
      `UPDATE remisiones SET ${fields.join(', ')} WHERE usuario_id = ? AND campana_id = ? AND id = ?`,
      values
    );

    return this.getRemisionById(userId, campanaId, remisionId);
  },

  async getRemisionById(userId, campanaId, remisionId) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id,
              fecha,
              nombre_conductor,
              cc_conductor,
              vehiculo_placa,
              origen,
              cantidad,
              variedad,
              enviado_por,
              enviado_cc,
              valor_flete,
              firma_conductor,
              firma_propietario,
              nota
         FROM remisiones
        WHERE usuario_id = ? AND campana_id = ? AND id = ?`,
      [userId, campanaId, remisionId]
    );

    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      fecha: row.fecha,
      nombreConductor: row.nombre_conductor,
      ccConductor: row.cc_conductor,
      vehiculoPlaca: row.vehiculo_placa,
      origen: row.origen,
      cantidad: row.cantidad,
      variedad: row.variedad,
      enviadoPor: row.enviado_por,
      enviadoCc: row.enviado_cc,
      valorFlete: row.valor_flete,
      firmaConductor: row.firma_conductor,
      firmaPropietario: row.firma_propietario,
      nota: row.nota,
    };
  },

  async removeRemision(userId, campanaId, remisionId) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM remisiones WHERE usuario_id = ? AND campana_id = ? AND id = ?',
      [userId, campanaId, remisionId]
    );
    return result.affectedRows > 0;
  },
};
