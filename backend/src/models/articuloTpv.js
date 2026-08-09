const pool = require('../config/database');

const ArticuloTpv = {
  crear: async (datos) => {
    const { nombre, producto_id, categoria, precio_base, color, icono, opciones } = datos;
    const result = await pool.query(
      `INSERT INTO articulos_tpv (nombre, producto_id, categoria, precio_base, color, icono, opciones)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [nombre, producto_id || null, categoria, precio_base, color || 'gray', icono || 'cube', opciones ? JSON.stringify(opciones) : '[]']
    );
    return result.rows[0];
  },

  buscarTodos: async () => {
    const result = await pool.query(`
      SELECT a.*, p.stock_actual, p.nombre as producto_nombre 
      FROM articulos_tpv a
      LEFT JOIN productos p ON a.producto_id = p.id
      WHERE a.activo = true 
      ORDER BY a.nombre
    `);
    return result.rows;
  },

  buscarPorId: async (id) => {
    const result = await pool.query(`
      SELECT a.*, p.stock_actual, p.nombre as producto_nombre 
      FROM articulos_tpv a
      LEFT JOIN productos p ON a.producto_id = p.id
      WHERE a.id = $1
    `, [id]);
    return result.rows[0];
  },

  actualizar: async (id, datos) => {
    const { nombre, producto_id, categoria, precio_base, color, icono, opciones, activo } = datos;
    const result = await pool.query(
      `UPDATE articulos_tpv SET nombre=$1, producto_id=$2, categoria=$3, precio_base=$4, color=$5, icono=$6, opciones=$7, activo=$8
       WHERE id=$9 RETURNING *`,
      [nombre, producto_id || null, categoria, precio_base, color, icono, opciones ? JSON.stringify(opciones) : '[]', activo !== false, id]
    );
    return result.rows[0];
  },

  borrar: async (id) => {
    const result = await pool.query('UPDATE articulos_tpv SET activo = false WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = ArticuloTpv;
