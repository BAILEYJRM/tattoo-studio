const pool = require('../config/database');

const Limpieza = {
  crear: async ({ cabina_id, empleado_id, tipo, fecha, hora_inicio, hora_fin, observaciones }, estudio_id) => {
    const result = await pool.query(
      `INSERT INTO limpiezas (cabina_id, empleado_id, tipo, fecha, hora_inicio, hora_fin, observaciones, estudio_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [cabina_id, empleado_id, tipo, fecha, hora_inicio, hora_fin || null, observaciones, estudio_id]
    );
    return result.rows[0];
  },

  buscarTodas: async ({ cabina_id, fecha } = {}, estudio_id) => {
    let q = `
      SELECT l.*, c.nombre AS cabina_nombre, e.nombre AS empleado_nombre
      FROM limpiezas l
      LEFT JOIN cabinas c ON c.id = l.cabina_id
      LEFT JOIN empleados e ON e.id = l.empleado_id
      WHERE l.estudio_id = $1
    `;
    const values = [estudio_id];
    if (cabina_id) { values.push(cabina_id); q += ` AND l.cabina_id = $${values.length}`; }
    if (fecha)     { values.push(fecha);     q += ` AND l.fecha = $${values.length}`; }
    q += ' ORDER BY l.fecha DESC, l.hora_inicio DESC';
    const result = await pool.query(q, values);
    return result.rows;
  },

  resumenHoy: async (fecha, estudio_id) => {
    const result = await pool.query(
      `SELECT tipo, COUNT(*) AS total FROM limpiezas WHERE fecha = $1 AND estudio_id = $2 GROUP BY tipo`,
      [fecha, estudio_id]
    );
    return result.rows;
  },

  actualizar: async (id, { tipo, hora_inicio, hora_fin, observaciones }, estudio_id) => {
    const result = await pool.query(
      `UPDATE limpiezas SET tipo=$1, hora_inicio=$2, hora_fin=$3, observaciones=$4
       WHERE id=$5 AND estudio_id=$6 RETURNING *`,
      [tipo, hora_inicio, hora_fin || null, observaciones, id, estudio_id]
    );
    return result.rows[0];
  },

  eliminar: async (id, estudio_id) => {
    await pool.query('DELETE FROM limpiezas WHERE id=$1 AND estudio_id=$2', [id, estudio_id]);
  },
};

module.exports = Limpieza;
