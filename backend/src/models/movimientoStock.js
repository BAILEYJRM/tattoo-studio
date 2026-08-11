const pool = require('../config/database');

const MovimientoStock = {
  crear: async (datos, estudio_id) => {
    const { producto_id, tipo, cantidad, motivo, referencia_id, notas, empleado_id } = datos;
    const result = await pool.query(
      `INSERT INTO movimientos_stock (producto_id, tipo, cantidad, motivo, referencia_id, notas, empleado_id, estudio_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [producto_id, tipo, cantidad, motivo, referencia_id || null, notas, empleado_id, estudio_id]
    );
    return result.rows[0];
  },

  buscarPorProducto: async (producto_id, estudio_id) => {
    const result = await pool.query(
      `SELECT ms.*, e.nombre as empleado_nombre
       FROM movimientos_stock ms
       LEFT JOIN empleados e ON e.id = ms.empleado_id
       WHERE ms.producto_id = $1 AND ms.estudio_id = $2 ORDER BY ms.created_at DESC`,
      [producto_id, estudio_id]
    );
    return result.rows;
  },

  buscarTodos: async (estudio_id) => {
    const result = await pool.query(
      `SELECT ms.*, p.nombre as producto_nombre, p.sku, e.nombre as empleado_nombre
       FROM movimientos_stock ms
       LEFT JOIN productos p ON p.id = ms.producto_id
       LEFT JOIN empleados e ON e.id = ms.empleado_id
       WHERE ms.estudio_id = $1
       ORDER BY ms.created_at DESC`,
       [estudio_id]
    );
    return result.rows;
  },
};

module.exports = MovimientoStock;
