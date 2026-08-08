const pool = require('../config/database');

const Producto = {
  crear: async (datos) => {
    const { sku, nombre, descripcion, categoria, codigo_barras, precio_compra, precio_venta,
      stock_actual, stock_minimo, lote, fecha_caducidad, proveedor } = datos;
    const result = await pool.query(
      `INSERT INTO productos (sku, nombre, descripcion, categoria, codigo_barras, precio_compra,
        precio_venta, stock_actual, stock_minimo, lote, fecha_caducidad, proveedor)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [sku, nombre, descripcion, categoria, codigo_barras, precio_compra, precio_venta,
        stock_actual || 0, stock_minimo || 0, lote, fecha_caducidad || null, proveedor]
    );
    return result.rows[0];
  },

  buscarTodos: async () => {
    const result = await pool.query(
      'SELECT * FROM productos WHERE activo = true ORDER BY nombre'
    );
    return result.rows;
  },

  buscarPorId: async (id) => {
    const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    return result.rows[0];
  },

  buscar: async (q) => {
    const result = await pool.query(
      `SELECT * FROM productos WHERE activo = true
       AND (nombre ILIKE $1 OR sku ILIKE $1 OR codigo_barras ILIKE $1)
       ORDER BY nombre`,
      [`%${q}%`]
    );
    return result.rows;
  },

  actualizar: async (id, datos) => {
    const { sku, nombre, descripcion, categoria, codigo_barras, precio_compra, precio_venta,
      stock_actual, stock_minimo, lote, fecha_caducidad, proveedor, activo } = datos;
    const result = await pool.query(
      `UPDATE productos SET sku=$1, nombre=$2, descripcion=$3, categoria=$4, codigo_barras=$5,
        precio_compra=$6, precio_venta=$7, stock_actual=$8, stock_minimo=$9, lote=$10,
        fecha_caducidad=$11, proveedor=$12, activo=$13
       WHERE id=$14 RETURNING *`,
      [sku, nombre, descripcion, categoria, codigo_barras, precio_compra, precio_venta,
        stock_actual, stock_minimo, lote, fecha_caducidad || null, proveedor,
        activo !== false, id]
    );
    return result.rows[0];
  },

  actualizarStock: async (id, delta) => {
    const result = await pool.query(
      'UPDATE productos SET stock_actual = stock_actual + $1 WHERE id = $2 RETURNING *',
      [delta, id]
    );
    return result.rows[0];
  },

  stockBajo: async () => {
    const result = await pool.query(
      'SELECT * FROM productos WHERE activo = true AND stock_actual <= stock_minimo ORDER BY nombre'
    );
    return result.rows;
  },
};

module.exports = Producto;
