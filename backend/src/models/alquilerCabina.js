const pool = require('../config/database');

const AlquilerCabina = {
  async buscarTodos() {
    const result = await pool.query(`
      SELECT ac.*, c.nombre as cabina_nombre, e.nombre as artista_nombre, e.apellidos as artista_apellidos
      FROM alquileres_cabina ac
      JOIN cabinas c ON c.id = ac.cabina_id
      JOIN empleados e ON e.id = ac.artista_id
      ORDER BY ac.fecha_proximo_pago ASC
    `);
    return result.rows;
  },

  async crear(data) {
    const { cabina_id, artista_id, tarifa_monto, frecuencia, fecha_proximo_pago, notas } = data;
    const result = await pool.query(
      `INSERT INTO alquileres_cabina (
        cabina_id, artista_id, tarifa_monto, frecuencia, fecha_proximo_pago, estado, notas
      ) VALUES ($1, $2, $3, $4, $5, 'al dia', $6)
      RETURNING *`,
      [cabina_id, artista_id, tarifa_monto, frecuencia || 'semanal', fecha_proximo_pago, notas]
    );
    return result.rows[0];
  },

  async registrarPago(alquiler_id, monto, metodo_pago, notas) {
    // 1. Insertar cobro
    await pool.query(
      `INSERT INTO cobros_alquiler_cabina (alquiler_id, monto, fecha_pago, metodo_pago, notas)
       VALUES ($1, $2, CURRENT_DATE, $3, $4)`,
      [alquiler_id, monto, metodo_pago || 'efectivo', notas]
    );

    // 2. Calcular nueva fecha de próximo pago
    const alquilerRes = await pool.query('SELECT * FROM alquileres_cabina WHERE id = $1', [alquiler_id]);
    const alquiler = alquilerRes.rows[0];
    if (!alquiler) return null;

    let proximaFecha = new Date(alquiler.fecha_proximo_pago);
    if (alquiler.frecuencia === 'semanal') {
      proximaFecha.setDate(proximaFecha.getDate() + 7);
    } else {
      proximaFecha.setMonth(proximaFecha.getMonth() + 1);
    }

    const updated = await pool.query(
      `UPDATE alquileres_cabina
       SET fecha_proximo_pago = $1, estado = 'al dia'
       WHERE id = $2
       RETURNING *`,
      [proximaFecha.toISOString().slice(0, 10), alquiler_id]
    );

    return updated.rows[0];
  }
};

module.exports = AlquilerCabina;
