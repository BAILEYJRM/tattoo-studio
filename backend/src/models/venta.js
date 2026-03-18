const pool = require('../config/database');

const Venta = {
  crear: async (datos, lineas) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { cliente_id, cita_id, fecha, subtotal, total, metodo_pago, estado, notas, empleado_id } = datos;
      const ventaRes = await client.query(
        `INSERT INTO ventas (cliente_id, cita_id, fecha, subtotal, total, metodo_pago, estado, notas, empleado_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [cliente_id || null, cita_id || null, fecha, subtotal, total,
          metodo_pago || 'efectivo', estado || 'pagado', notas, empleado_id]
      );
      const venta = ventaRes.rows[0];

      for (const linea of lineas) {
        const { tipo, producto_id, descripcion, cantidad, precio_unitario, subtotal: lineaSub } = linea;
        await client.query(
          `INSERT INTO venta_lineas (venta_id, tipo, producto_id, descripcion, cantidad, precio_unitario, subtotal)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [venta.id, tipo, producto_id || null, descripcion, cantidad, precio_unitario, lineaSub]
        );
        if (tipo === 'producto' && producto_id) {
          await client.query(
            'UPDATE productos SET stock_actual = stock_actual - $1 WHERE id = $2',
            [cantidad, producto_id]
          );
          await client.query(
            `INSERT INTO movimientos_stock (producto_id, tipo, cantidad, motivo, referencia_id, empleado_id)
             VALUES ($1, 'salida', $2, 'venta', $3, $4)`,
            [producto_id, cantidad, venta.id, empleado_id]
          );
        }
      }

      await client.query('COMMIT');
      return venta;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  buscarTodas: async (params = {}) => {
    let q = `SELECT v.*, c.nombre || ' ' || c.apellidos as cliente_nombre, e.nombre as empleado_nombre
             FROM ventas v
             LEFT JOIN clientes c ON c.id = v.cliente_id
             LEFT JOIN empleados e ON e.id = v.empleado_id`;
    const conditions = [];
    const values = [];
    if (params.fecha_desde) { values.push(params.fecha_desde); conditions.push(`v.fecha >= $${values.length}`); }
    if (params.fecha_hasta) { values.push(params.fecha_hasta); conditions.push(`v.fecha <= $${values.length}`); }
    if (params.estado) { values.push(params.estado); conditions.push(`v.estado = $${values.length}`); }
    if (conditions.length) q += ' WHERE ' + conditions.join(' AND ');
    q += ' ORDER BY v.fecha DESC, v.created_at DESC';
    const result = await pool.query(q, values);
    return result.rows;
  },

  buscarPorId: async (id) => {
    const ventaRes = await pool.query(
      `SELECT v.*, c.nombre || ' ' || c.apellidos as cliente_nombre, e.nombre as empleado_nombre
       FROM ventas v
       LEFT JOIN clientes c ON c.id = v.cliente_id
       LEFT JOIN empleados e ON e.id = v.empleado_id
       WHERE v.id = $1`,
      [id]
    );
    const venta = ventaRes.rows[0];
    if (!venta) return null;
    const lineasRes = await pool.query(
      `SELECT vl.*, p.nombre as producto_nombre FROM venta_lineas vl
       LEFT JOIN productos p ON p.id = vl.producto_id
       WHERE vl.venta_id = $1`,
      [id]
    );
    venta.lineas = lineasRes.rows;
    return venta;
  },

  actualizar: async (id, datos) => {
    const { estado, notas, metodo_pago } = datos;
    const result = await pool.query(
      'UPDATE ventas SET estado=$1, notas=$2, metodo_pago=$3 WHERE id=$4 RETURNING *',
      [estado, notas, metodo_pago, id]
    );
    return result.rows[0];
  },

  resumenDia: async (fecha) => {
    const result = await pool.query(
      `SELECT COUNT(*) as num_ventas, COALESCE(SUM(total),0) as total,
         COALESCE(SUM(CASE WHEN metodo_pago='efectivo' THEN total ELSE 0 END),0) as efectivo,
         COALESCE(SUM(CASE WHEN metodo_pago='tarjeta' THEN total ELSE 0 END),0) as tarjeta,
         COALESCE(SUM(CASE WHEN metodo_pago='bizum' THEN total ELSE 0 END),0) as bizum
       FROM ventas WHERE fecha = $1 AND estado = 'pagado'`,
      [fecha]
    );
    return result.rows[0];
  },

  resumenMes: async (year, month) => {
    const result = await pool.query(
      `SELECT COALESCE(SUM(total),0) as total, COUNT(*) as num_ventas
       FROM ventas
       WHERE EXTRACT(YEAR FROM fecha) = $1 AND EXTRACT(MONTH FROM fecha) = $2 AND estado = 'pagado'`,
      [year, month]
    );
    return result.rows[0];
  },
};

module.exports = Venta;
