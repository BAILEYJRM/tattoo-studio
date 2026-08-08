const pool = require('../config/database');

const Tinta = {
  crear: async (d) => {
    const r = await pool.query(
      `INSERT INTO tintas (nombre, marca, color, codigo, numero_lote, fecha_caducidad, homologada, producto_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [d.nombre, d.marca||null, d.color||null, d.codigo||null, d.numero_lote||null,
       d.fecha_caducidad||null, d.homologada!==false, d.producto_id||null]
    );
    return r.rows[0];
  },

  buscarTodas: async ({ buscar, marca } = {}) => {
    const conds = ['t.activa = true'];
    const vals = [];
    if (buscar) { vals.push(`%${buscar}%`); conds.push(`(t.nombre ILIKE $${vals.length} OR t.marca ILIKE $${vals.length} OR t.codigo ILIKE $${vals.length})`); }
    if (marca) { vals.push(marca); conds.push(`t.marca = $${vals.length}`); }
    const r = await pool.query(
      `SELECT t.*, p.nombre AS producto_nombre FROM tintas t
       LEFT JOIN productos p ON p.id = t.producto_id
       WHERE ${conds.join(' AND ')} ORDER BY t.nombre`,
      vals
    );
    return r.rows;
  },

  buscarPorId: async (id) => {
    const r = await pool.query('SELECT * FROM tintas WHERE id = $1', [id]);
    return r.rows[0] || null;
  },

  actualizar: async (id, d) => {
    const r = await pool.query(
      `UPDATE tintas SET nombre=$1, marca=$2, color=$3, codigo=$4, numero_lote=$5,
       fecha_caducidad=$6, homologada=$7, producto_id=$8 WHERE id=$9 RETURNING *`,
      [d.nombre, d.marca||null, d.color||null, d.codigo||null, d.numero_lote||null,
       d.fecha_caducidad||null, d.homologada!==false, d.producto_id||null, id]
    );
    return r.rows[0];
  },

  desactivar: async (id) => {
    const r = await pool.query('UPDATE tintas SET activa = false WHERE id = $1 RETURNING *', [id]);
    return r.rows[0];
  },

  buscarProximasCaducidad: async (dias = 30) => {
    const r = await pool.query(
      `SELECT t.*, p.nombre AS producto_nombre FROM tintas t
       LEFT JOIN productos p ON p.id = t.producto_id
       WHERE t.activa = true AND t.fecha_caducidad IS NOT NULL
         AND t.fecha_caducidad <= CURRENT_DATE + ($1 || ' days')::INTERVAL
         AND t.fecha_caducidad >= CURRENT_DATE
       ORDER BY t.fecha_caducidad`,
      [dias]
    );
    return r.rows;
  },

  getDefectosArtista: async (empleado_id) => {
    const r = await pool.query(
      `SELECT t.* FROM tintas t
       JOIN artista_tintas_defecto atd ON atd.tinta_id = t.id
       WHERE atd.empleado_id = $1 AND t.activa = true ORDER BY t.nombre`,
      [empleado_id]
    );
    return r.rows;
  },

  addDefectoArtista: async (empleado_id, tinta_id) => {
    await pool.query(
      'INSERT INTO artista_tintas_defecto (empleado_id, tinta_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [empleado_id, tinta_id]
    );
  },

  removeDefectoArtista: async (empleado_id, tinta_id) => {
    await pool.query(
      'DELETE FROM artista_tintas_defecto WHERE empleado_id=$1 AND tinta_id=$2',
      [empleado_id, tinta_id]
    );
  },
};

module.exports = Tinta;
