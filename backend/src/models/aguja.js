const pool = require('../config/database');

const Aguja = {
  crear: async (d) => {
    const r = await pool.query(
      `INSERT INTO agujas (marca, modelo, tipo, numero_lote, fecha_caducidad, fecha_fabricacion, producto_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [d.marca||null, d.modelo||null, d.tipo||null, d.numero_lote||null,
       d.fecha_caducidad||null, d.fecha_fabricacion||null, d.producto_id||null]
    );
    return r.rows[0];
  },

  buscarTodas: async ({ buscar, marca } = {}) => {
    const conds = ['a.activa = true'];
    const vals = [];
    if (buscar) { vals.push(`%${buscar}%`); conds.push(`(a.marca ILIKE $${vals.length} OR a.modelo ILIKE $${vals.length} OR a.tipo ILIKE $${vals.length})`); }
    if (marca) { vals.push(marca); conds.push(`a.marca = $${vals.length}`); }
    const r = await pool.query(
      `SELECT a.*, p.nombre AS producto_nombre FROM agujas a
       LEFT JOIN productos p ON p.id = a.producto_id
       WHERE ${conds.join(' AND ')} ORDER BY a.marca, a.modelo`,
      vals
    );
    return r.rows;
  },

  buscarPorId: async (id) => {
    const r = await pool.query('SELECT * FROM agujas WHERE id = $1', [id]);
    return r.rows[0] || null;
  },

  actualizar: async (id, d) => {
    const r = await pool.query(
      `UPDATE agujas SET marca=$1, modelo=$2, tipo=$3, numero_lote=$4,
       fecha_caducidad=$5, fecha_fabricacion=$6, producto_id=$7 WHERE id=$8 RETURNING *`,
      [d.marca||null, d.modelo||null, d.tipo||null, d.numero_lote||null,
       d.fecha_caducidad||null, d.fecha_fabricacion||null, d.producto_id||null, id]
    );
    return r.rows[0];
  },

  desactivar: async (id) => {
    const r = await pool.query('UPDATE agujas SET activa = false WHERE id = $1 RETURNING *', [id]);
    return r.rows[0];
  },

  buscarProximasCaducidad: async (dias = 30) => {
    const r = await pool.query(
      `SELECT a.*, p.nombre AS producto_nombre FROM agujas a
       LEFT JOIN productos p ON p.id = a.producto_id
       WHERE a.activa = true AND a.fecha_caducidad IS NOT NULL
         AND a.fecha_caducidad <= CURRENT_DATE + ($1 || ' days')::INTERVAL
         AND a.fecha_caducidad >= CURRENT_DATE
       ORDER BY a.fecha_caducidad`,
      [dias]
    );
    return r.rows;
  },

  getDefectosArtista: async (empleado_id) => {
    const r = await pool.query(
      `SELECT a.* FROM agujas a
       JOIN artista_agujas_defecto aad ON aad.aguja_id = a.id
       WHERE aad.empleado_id = $1 AND a.activa = true ORDER BY a.marca, a.modelo`,
      [empleado_id]
    );
    return r.rows;
  },

  addDefectoArtista: async (empleado_id, aguja_id) => {
    await pool.query(
      'INSERT INTO artista_agujas_defecto (empleado_id, aguja_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [empleado_id, aguja_id]
    );
  },

  removeDefectoArtista: async (empleado_id, aguja_id) => {
    await pool.query(
      'DELETE FROM artista_agujas_defecto WHERE empleado_id=$1 AND aguja_id=$2',
      [empleado_id, aguja_id]
    );
  },
};

module.exports = Aguja;
