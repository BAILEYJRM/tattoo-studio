const pool = require('../config/database');

const ArticuloTpv = {
  crear: async (datos, estudio_id) => {
    const { nombre, producto_id, categoria, precio_base, color, icono, opciones } = datos;
    const result = await pool.query(
      `INSERT INTO articulos_tpv (nombre, producto_id, categoria, precio_base, color, icono, opciones, estudio_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [nombre, producto_id || null, categoria, precio_base, color || 'gray', icono || 'cube', opciones ? JSON.stringify(opciones) : '[]', estudio_id]
    );
    return result.rows[0];
  },

  buscarTodos: async (estudio_id) => {
    const result = await pool.query(`
      SELECT a.*, p.stock_actual, p.nombre as producto_nombre 
      FROM articulos_tpv a
      LEFT JOIN productos p ON a.producto_id = p.id
      WHERE a.activo = true AND a.estudio_id = $1
      ORDER BY a.nombre
    `, [estudio_id]);
    return result.rows;
  },

  buscarPorId: async (id, estudio_id) => {
    const result = await pool.query(`
      SELECT a.*, p.stock_actual, p.nombre as producto_nombre 
      FROM articulos_tpv a
      LEFT JOIN productos p ON a.producto_id = p.id
      WHERE a.id = $1 AND a.estudio_id = $2
    `, [id, estudio_id]);
    return result.rows[0];
  },

  actualizar: async (id, datos, estudio_id) => {
    const { nombre, producto_id, categoria, precio_base, color, icono, opciones, activo } = datos;
    const result = await pool.query(
      `UPDATE articulos_tpv SET nombre=$1, producto_id=$2, categoria=$3, precio_base=$4, color=$5, icono=$6, opciones=$7, activo=$8
       WHERE id=$9 AND estudio_id=$10 RETURNING *`,
      [nombre, producto_id || null, categoria, precio_base, color, icono, opciones ? JSON.stringify(opciones) : '[]', activo !== false, id, estudio_id]
    );
    return result.rows[0];
  },

  borrar: async (id, estudio_id) => {
    const result = await pool.query('UPDATE articulos_tpv SET activo = false WHERE id = $1 AND estudio_id = $2 RETURNING *', [id, estudio_id]);
    return result.rows[0];
  }
};

module.exports = ArticuloTpv;
