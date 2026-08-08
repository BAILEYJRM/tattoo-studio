const pool = require('../config/database');

const Cabina = {
  buscarTodas: async () => {
    const result = await pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM incidencias i WHERE i.cabina_id = c.id AND i.estado = 'abierta') AS incidencias_abiertas
      FROM cabinas c
      WHERE c.activo = true
      ORDER BY c.nombre
    `);
    return result.rows;
  },

  buscarPorId: async (id) => {
    const result = await pool.query('SELECT * FROM cabinas WHERE id = $1', [id]);
    return result.rows[0];
  },

  crear: async ({ nombre, descripcion }) => {
    const result = await pool.query(
      'INSERT INTO cabinas (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    return result.rows[0];
  },

  actualizar: async (id, { nombre, descripcion, activo }) => {
    const result = await pool.query(
      'UPDATE cabinas SET nombre=$1, descripcion=$2, activo=$3 WHERE id=$4 RETURNING *',
      [nombre, descripcion, activo !== false, id]
    );
    return result.rows[0];
  },

  cambiarEstado: async (id, estado) => {
    const result = await pool.query(
      'UPDATE cabinas SET estado=$1 WHERE id=$2 RETURNING *',
      [estado, id]
    );
    return result.rows[0];
  },
};

module.exports = Cabina;
