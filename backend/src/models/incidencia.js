const pool = require('../config/database');

const Incidencia = {
  crear: async ({ cabina_id, empleado_id, titulo, descripcion, foto_path, fecha }, estudio_id) => {
    const result = await pool.query(
      `INSERT INTO incidencias (cabina_id, empleado_id, titulo, descripcion, foto_path, fecha, estudio_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [cabina_id, empleado_id, titulo, descripcion, foto_path || null, fecha, estudio_id]
    );
    return result.rows[0];
  },

  buscarTodas: async ({ cabina_id, estado } = {}, estudio_id) => {
    let q = `
      SELECT i.*, c.nombre AS cabina_nombre, e.nombre AS empleado_nombre
      FROM incidencias i
      LEFT JOIN cabinas c ON c.id = i.cabina_id
      LEFT JOIN empleados e ON e.id = i.empleado_id
      WHERE i.estudio_id = $1
    `;
    const values = [estudio_id];
    if (cabina_id) { values.push(cabina_id); q += ` AND i.cabina_id = $${values.length}`; }
    if (estado)    { values.push(estado);    q += ` AND i.estado = $${values.length}`; }
    q += ' ORDER BY i.created_at DESC';
    const result = await pool.query(q, values);
    return result.rows;
  },

  buscarPorId: async (id, estudio_id) => {
    const result = await pool.query(
      `SELECT i.*, c.nombre AS cabina_nombre, e.nombre AS empleado_nombre
       FROM incidencias i
       LEFT JOIN cabinas c ON c.id = i.cabina_id
       LEFT JOIN empleados e ON e.id = i.empleado_id
       WHERE i.id = $1 AND i.estudio_id = $2`,
      [id, estudio_id]
    );
    return result.rows[0];
  },

  resolver: async (id, estudio_id) => {
    const result = await pool.query(
      `UPDATE incidencias SET estado='resuelta', resuelta_en=NOW() WHERE id=$1 AND estudio_id=$2 RETURNING *`,
      [id, estudio_id]
    );
    return result.rows[0];
  },

  actualizar: async (id, { titulo, descripcion }, estudio_id) => {
    const result = await pool.query(
      'UPDATE incidencias SET titulo=$1, descripcion=$2 WHERE id=$3 AND estudio_id=$4 RETURNING *',
      [titulo, descripcion, id, estudio_id]
    );
    return result.rows[0];
  },
};

module.exports = Incidencia;
