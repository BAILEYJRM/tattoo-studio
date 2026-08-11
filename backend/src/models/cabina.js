const pool = require('../config/database');

const Cabina = {
  buscarTodas: async (estudio_id) => {
    const result = await pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM incidencias i WHERE i.cabina_id = c.id AND i.estado = 'abierta') AS incidencias_abiertas
      FROM cabinas c
      WHERE c.activo = true AND c.estudio_id = $1
      ORDER BY c.nombre
    `, [estudio_id]);
    return result.rows;
  },

  buscarPorId: async (id, estudio_id) => {
    const result = await pool.query('SELECT * FROM cabinas WHERE id = $1 AND estudio_id = $2', [id, estudio_id]);
    return result.rows[0];
  },

  crear: async ({ nombre, descripcion, estudio_id }) => {
    const result = await pool.query(
      'INSERT INTO cabinas (nombre, descripcion, estudio_id) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion, estudio_id]
    );
    return result.rows[0];
  },

  actualizar: async (id, { nombre, descripcion, activo }, estudio_id) => {
    const result = await pool.query(
      'UPDATE cabinas SET nombre=$1, descripcion=$2, activo=$3 WHERE id=$4 AND estudio_id=$5 RETURNING *',
      [nombre, descripcion, activo !== false, id, estudio_id]
    );
    return result.rows[0];
  },

  cambiarEstado: async (id, estado, estudio_id) => {
    const result = await pool.query(
      'UPDATE cabinas SET estado=$1 WHERE id=$2 AND estudio_id=$3 RETURNING *',
      [estado, id, estudio_id]
    );
    return result.rows[0];
  },
};

module.exports = Cabina;
