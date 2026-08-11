const pool = require('../config/database');

const Seguimiento = {
  async crear(data) {
    const {
      lead_id,
      proyecto_id,
      fecha_hora,
      responsable_id,
      motivo,
      estado,
      notas
    } = data;
    const result = await pool.query(
      `INSERT INTO seguimientos (
        lead_id, proyecto_id, fecha_hora, responsable_id, motivo, estado, notas
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7
      ) RETURNING *`,
      [lead_id, proyecto_id, fecha_hora, responsable_id, motivo, estado || 'Pendiente', notas]
    );
    return result.rows[0];
  },

  async buscarTodos() {
    const result = await pool.query('SELECT * FROM seguimientos ORDER BY fecha_hora DESC');
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query('SELECT * FROM seguimientos WHERE id=$1', [id]);
    return result.rows[0];
  },

  async actualizar(id, data) {
    const {
      lead_id,
      proyecto_id,
      fecha_hora,
      responsable_id,
      motivo,
      estado,
      notas
    } = data;
    const result = await pool.query(
      `UPDATE seguimientos SET
        lead_id=$1, proyecto_id=$2, fecha_hora=$3, responsable_id=$4,
        motivo=$5, estado=$6, notas=$7
       WHERE id=$8 RETURNING *`,
      [lead_id, proyecto_id, fecha_hora, responsable_id, motivo, estado, notas, id]
    );
    return result.rows[0];
  }
};

module.exports = Seguimiento;
