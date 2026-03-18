const pool = require('../config/database');

const EventoCalendario = {
  async crear({ empleado_id, titulo, descripcion, fecha_inicio, fecha_fin, tipo }) {
    const result = await pool.query(
      `INSERT INTO eventos_calendario (empleado_id, titulo, descripcion, fecha_inicio, fecha_fin, tipo)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [empleado_id, titulo, descripcion, fecha_inicio, fecha_fin, tipo || 'otro']
    );
    return result.rows[0];
  },

  async buscarTodos({ fecha_inicio, fecha_fin, empleado_id } = {}) {
    const conditions = [];
    const values = [];
    if (fecha_inicio) {
      conditions.push(`e.fecha_fin >= $${values.length + 1}`);
      values.push(fecha_inicio);
    }
    if (fecha_fin) {
      conditions.push(`e.fecha_inicio <= $${values.length + 1}`);
      values.push(fecha_fin);
    }
    if (empleado_id) {
      conditions.push(`e.empleado_id = $${values.length + 1}`);
      values.push(empleado_id);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT e.*, emp.nombre || ' ' || emp.apellidos AS empleado_nombre, emp.color_calendario
       FROM eventos_calendario e
       LEFT JOIN empleados emp ON e.empleado_id = emp.id
       ${where}
       ORDER BY e.fecha_inicio`,
      values
    );
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query(
      `SELECT e.*, emp.nombre || ' ' || emp.apellidos AS empleado_nombre
       FROM eventos_calendario e
       LEFT JOIN empleados emp ON e.empleado_id = emp.id
       WHERE e.id=$1`,
      [id]
    );
    return result.rows[0];
  },

  async actualizar(id, { empleado_id, titulo, descripcion, fecha_inicio, fecha_fin, tipo }) {
    const result = await pool.query(
      `UPDATE eventos_calendario SET
        empleado_id=$1, titulo=$2, descripcion=$3, fecha_inicio=$4, fecha_fin=$5, tipo=$6
       WHERE id=$7 RETURNING *`,
      [empleado_id, titulo, descripcion, fecha_inicio, fecha_fin, tipo, id]
    );
    return result.rows[0];
  },

  async eliminar(id) {
    const result = await pool.query(
      'DELETE FROM eventos_calendario WHERE id=$1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },
};

module.exports = EventoCalendario;
