const pool = require('../config/database');

const Gasto = {
  crear: async (datos) => {
    const { fecha, concepto, tipo, categoria, importe, proveedor, producto_id, notas, empleado_id } = datos;
    const result = await pool.query(
      `INSERT INTO gastos (fecha, concepto, tipo, categoria, importe, proveedor, producto_id, notas, empleado_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [fecha, concepto, tipo, categoria, importe, proveedor, producto_id || null, notas, empleado_id]
    );
    return result.rows[0];
  },

  buscarTodos: async (params = {}) => {
    let q = `SELECT g.*, e.nombre as empleado_nombre, p.nombre as producto_nombre
             FROM gastos g
             LEFT JOIN empleados e ON e.id = g.empleado_id
             LEFT JOIN productos p ON p.id = g.producto_id`;
    const conditions = [];
    const values = [];
    if (params.tipo) { values.push(params.tipo); conditions.push(`g.tipo = $${values.length}`); }
    if (params.categoria) { values.push(params.categoria); conditions.push(`g.categoria = $${values.length}`); }
    if (params.fecha_desde) { values.push(params.fecha_desde); conditions.push(`g.fecha >= $${values.length}`); }
    if (params.fecha_hasta) { values.push(params.fecha_hasta); conditions.push(`g.fecha <= $${values.length}`); }
    if (conditions.length) q += ' WHERE ' + conditions.join(' AND ');
    q += ' ORDER BY g.fecha DESC, g.created_at DESC';
    const result = await pool.query(q, values);
    return result.rows;
  },

  buscarPorId: async (id) => {
    const result = await pool.query(
      `SELECT g.*, e.nombre as empleado_nombre FROM gastos g
       LEFT JOIN empleados e ON e.id = g.empleado_id
       WHERE g.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  actualizar: async (id, datos) => {
    const { fecha, concepto, tipo, categoria, importe, proveedor, notas } = datos;
    const result = await pool.query(
      `UPDATE gastos SET fecha=$1, concepto=$2, tipo=$3, categoria=$4, importe=$5,
        proveedor=$6, notas=$7 WHERE id=$8 RETURNING *`,
      [fecha, concepto, tipo, categoria, importe, proveedor, notas, id]
    );
    return result.rows[0];
  },

  eliminar: async (id) => {
    await pool.query('DELETE FROM gastos WHERE id = $1', [id]);
  },

  resumenMes: async (year, month) => {
    const result = await pool.query(
      `SELECT tipo, categoria, COALESCE(SUM(importe),0) as total
       FROM gastos
       WHERE EXTRACT(YEAR FROM fecha) = $1 AND EXTRACT(MONTH FROM fecha) = $2
       GROUP BY tipo, categoria
       ORDER BY tipo, categoria`,
      [year, month]
    );
    return result.rows;
  },

  totalMes: async (year, month) => {
    const result = await pool.query(
      `SELECT COALESCE(SUM(importe),0) as total
       FROM gastos
       WHERE EXTRACT(YEAR FROM fecha) = $1 AND EXTRACT(MONTH FROM fecha) = $2`,
      [year, month]
    );
    return result.rows[0];
  },
};

module.exports = Gasto;
