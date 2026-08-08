const pool = require('../config/database');

const Limpieza = {
  crear: async ({ cabina_id, empleado_id, tipo, fecha, hora_inicio, hora_fin, observaciones }) => {
    const result = await pool.query(
      `INSERT INTO limpiezas (cabina_id, empleado_id, tipo, fecha, hora_inicio, hora_fin, observaciones)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [cabina_id, empleado_id, tipo, fecha, hora_inicio, hora_fin || null, observaciones]
    );
    return result.rows[0];
  },

  buscarTodas: async ({ cabina_id, fecha } = {}) => {
    let q = `
      SELECT l.*, c.nombre AS cabina_nombre, e.nombre AS empleado_nombre
      FROM limpiezas l
      LEFT JOIN cabinas c ON c.id = l.cabina_id
      LEFT JOIN empleados e ON e.id = l.empleado_id
    `;
    const conditions = [];
    const values = [];
    if (cabina_id) { values.push(cabina_id); conditions.push(`l.cabina_id = $${values.length}`); }
    if (fecha)     { values.push(fecha);     conditions.push(`l.fecha = $${values.length}`); }
    if (conditions.length) q += ' WHERE ' + conditions.join(' AND ');
    q += ' ORDER BY l.fecha DESC, l.hora_inicio DESC';
    const result = await pool.query(q, values);
    return result.rows;
  },

  resumenHoy: async (fecha) => {
    const result = await pool.query(
      `SELECT tipo, COUNT(*) AS total FROM limpiezas WHERE fecha = $1 GROUP BY tipo`,
      [fecha]
    );
    return result.rows;
  },

  actualizar: async (id, { tipo, hora_inicio, hora_fin, observaciones }) => {
    const result = await pool.query(
      `UPDATE limpiezas SET tipo=$1, hora_inicio=$2, hora_fin=$3, observaciones=$4
       WHERE id=$5 RETURNING *`,
      [tipo, hora_inicio, hora_fin || null, observaciones, id]
    );
    return result.rows[0];
  },

  eliminar: async (id) => {
    await pool.query('DELETE FROM limpiezas WHERE id=$1', [id]);
  },
};

module.exports = Limpieza;
