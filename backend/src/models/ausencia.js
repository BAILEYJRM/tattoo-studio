const pool = require('../config/database');

const Ausencia = {
  async crear({ empleado_id, fecha_inicio, fecha_fin, hora_inicio, hora_fin, motivo }) {
    const result = await pool.query(
      `INSERT INTO ausencias_empleados (empleado_id, fecha_inicio, fecha_fin, hora_inicio, hora_fin, motivo)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [empleado_id, fecha_inicio, fecha_fin, hora_inicio, hora_fin, motivo]
    );
    return result.rows[0];
  },

  async buscarPorEmpleado(empleado_id) {
    const result = await pool.query(
      `SELECT * FROM ausencias_empleados WHERE empleado_id=$1 ORDER BY fecha_inicio`,
      [empleado_id]
    );
    return result.rows;
  },

  async buscarRango({ fecha_inicio, fecha_fin }) {
    const result = await pool.query(
      `SELECT a.*, e.nombre || ' ' || e.apellidos AS empleado_nombre, e.color_calendario
       FROM ausencias_empleados a
       JOIN empleados e ON a.empleado_id = e.id
       WHERE a.fecha_inicio <= $2 AND a.fecha_fin >= $1
       ORDER BY a.fecha_inicio`,
      [fecha_inicio, fecha_fin]
    );
    return result.rows;
  },

  async eliminar(id) {
    const result = await pool.query(
      'DELETE FROM ausencias_empleados WHERE id=$1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Ausencia;
