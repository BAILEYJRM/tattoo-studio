const pool = require('../config/database');

const Tinta = {
  crear: async (d, estudio_id) => {
    const r = await pool.query(
      `INSERT INTO tintas (nombre, marca, color, codigo, numero_lote, fecha_caducidad, homologada, producto_id, estudio_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [d.nombre, d.marca||null, d.color||null, d.codigo||null, d.numero_lote||null,
       d.fecha_caducidad||null, d.homologada!==false, d.producto_id||null, estudio_id]
    );
    return r.rows[0];
  },

  buscarTodas: async ({ buscar, marca } = {}, estudio_id) => {
    const conds = ['t.activa = true', 't.estudio_id = $1'];
    const vals = [estudio_id];
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

  buscarPorId: async (id, estudio_id) => {
    const r = await pool.query('SELECT * FROM tintas WHERE id = $1 AND estudio_id = $2', [id, estudio_id]);
    return r.rows[0] || null;
  },

  actualizar: async (id, d, estudio_id) => {
    const r = await pool.query(
      `UPDATE tintas SET nombre=$1, marca=$2, color=$3, codigo=$4, numero_lote=$5,
       fecha_caducidad=$6, homologada=$7, producto_id=$8 WHERE id=$9 AND estudio_id=$10 RETURNING *`,
      [d.nombre, d.marca||null, d.color||null, d.codigo||null, d.numero_lote||null,
       d.fecha_caducidad||null, d.homologada!==false, d.producto_id||null, id, estudio_id]
    );
    return r.rows[0];
  },

  desactivar: async (id, estudio_id) => {
    const r = await pool.query('UPDATE tintas SET activa = false WHERE id = $1 AND estudio_id = $2 RETURNING *', [id, estudio_id]);
    return r.rows[0];
  },

  buscarProximasCaducidad: async (dias = 30, estudio_id) => {
    const r = await pool.query(
      `SELECT t.*, p.nombre AS producto_nombre FROM tintas t
       LEFT JOIN productos p ON p.id = t.producto_id
       WHERE t.activa = true AND t.fecha_caducidad IS NOT NULL
         AND t.fecha_caducidad <= CURRENT_DATE + ($1 || ' days')::INTERVAL
         AND t.fecha_caducidad >= CURRENT_DATE
         AND t.estudio_id = $2
       ORDER BY t.fecha_caducidad`,
      [dias, estudio_id]
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
