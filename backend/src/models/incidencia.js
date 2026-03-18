const pool = require('../config/database');

const Incidencia = {
  crear: async ({ cabina_id, empleado_id, titulo, descripcion, foto_path, fecha }) => {
    const result = await pool.query(
      `INSERT INTO incidencias (cabina_id, empleado_id, titulo, descripcion, foto_path, fecha)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [cabina_id, empleado_id, titulo, descripcion, foto_path || null, fecha]
    );
    return result.rows[0];
  },

  buscarTodas: async ({ cabina_id, estado } = {}) => {
    let q = `
      SELECT i.*, c.nombre AS cabina_nombre, e.nombre AS empleado_nombre
      FROM incidencias i
      LEFT JOIN cabinas c ON c.id = i.cabina_id
      LEFT JOIN empleados e ON e.id = i.empleado_id
    `;
    const conditions = [];
    const values = [];
    if (cabina_id) { values.push(cabina_id); conditions.push(`i.cabina_id = $${values.length}`); }
    if (estado)    { values.push(estado);    conditions.push(`i.estado = $${values.length}`); }
    if (conditions.length) q += ' WHERE ' + conditions.join(' AND ');
    q += ' ORDER BY i.created_at DESC';
    const result = await pool.query(q, values);
    return result.rows;
  },

  buscarPorId: async (id) => {
    const result = await pool.query(
      `SELECT i.*, c.nombre AS cabina_nombre, e.nombre AS empleado_nombre
       FROM incidencias i
       LEFT JOIN cabinas c ON c.id = i.cabina_id
       LEFT JOIN empleados e ON e.id = i.empleado_id
       WHERE i.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  resolver: async (id) => {
    const result = await pool.query(
      `UPDATE incidencias SET estado='resuelta', resuelta_en=NOW() WHERE id=$1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  actualizar: async (id, { titulo, descripcion }) => {
    const result = await pool.query(
      'UPDATE incidencias SET titulo=$1, descripcion=$2 WHERE id=$3 RETURNING *',
      [titulo, descripcion, id]
    );
    return result.rows[0];
  },
};

module.exports = Incidencia;
