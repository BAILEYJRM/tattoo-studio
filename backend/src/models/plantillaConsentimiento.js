const pool = require('../config/database');

const PlantillaConsentimiento = {
  crear: async (datos) => {
    const { tipo, nombre, contenido } = datos;
    const result = await pool.query(
      `INSERT INTO plantillas_consentimiento (tipo, nombre, contenido)
       VALUES ($1, $2, $3) RETURNING *`,
      [tipo, nombre, contenido]
    );
    return result.rows[0];
  },

  buscarTodas: async () => {
    const result = await pool.query(
      'SELECT * FROM plantillas_consentimiento WHERE activo = true ORDER BY tipo, nombre'
    );
    return result.rows;
  },

  buscarPorTipo: async (tipo) => {
    const result = await pool.query(
      'SELECT * FROM plantillas_consentimiento WHERE tipo = $1 AND activo = true ORDER BY nombre',
      [tipo]
    );
    return result.rows;
  },

  buscarPorId: async (id) => {
    const result = await pool.query(
      'SELECT * FROM plantillas_consentimiento WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  actualizar: async (id, datos) => {
    const { tipo, nombre, contenido, activo } = datos;
    const result = await pool.query(
      `UPDATE plantillas_consentimiento SET tipo=$1, nombre=$2, contenido=$3, activo=$4
       WHERE id=$5 RETURNING *`,
      [tipo, nombre, contenido, activo !== false, id]
    );
    return result.rows[0];
  },

  contarPorTipo: async () => {
    const result = await pool.query(
      'SELECT tipo, COUNT(*) FROM plantillas_consentimiento WHERE activo = true GROUP BY tipo'
    );
    return result.rows;
  },
};

module.exports = PlantillaConsentimiento;
