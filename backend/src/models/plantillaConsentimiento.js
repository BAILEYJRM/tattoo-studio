const pool = require('../config/database');

const PlantillaConsentimiento = {
  crear: async (datos, estudio_id) => {
    const { tipo, nombre, contenido } = datos;
    const result = await pool.query(
      `INSERT INTO plantillas_consentimiento (tipo, nombre, contenido, estudio_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [tipo, nombre, contenido, estudio_id]
    );
    return result.rows[0];
  },

  buscarTodas: async (estudio_id) => {
    const result = await pool.query(
      'SELECT * FROM plantillas_consentimiento WHERE activo = true AND estudio_id = $1 ORDER BY tipo, nombre',
      [estudio_id]
    );
    return result.rows;
  },

  buscarPorTipo: async (tipo, estudio_id) => {
    const result = await pool.query(
      'SELECT * FROM plantillas_consentimiento WHERE tipo = $1 AND activo = true AND estudio_id = $2 ORDER BY nombre',
      [tipo, estudio_id]
    );
    return result.rows;
  },

  buscarPorId: async (id, estudio_id) => {
    const result = await pool.query(
      'SELECT * FROM plantillas_consentimiento WHERE id = $1 AND estudio_id = $2',
      [id, estudio_id]
    );
    return result.rows[0];
  },

  actualizar: async (id, datos, estudio_id) => {
    const { tipo, nombre, contenido, activo } = datos;
    const result = await pool.query(
      `UPDATE plantillas_consentimiento SET tipo=$1, nombre=$2, contenido=$3, activo=$4
       WHERE id=$5 AND estudio_id=$6 RETURNING *`,
      [tipo, nombre, contenido, activo !== false, id, estudio_id]
    );
    return result.rows[0];
  },

  contarPorTipo: async (estudio_id) => {
    const result = await pool.query(
      'SELECT tipo, COUNT(*) FROM plantillas_consentimiento WHERE activo = true AND estudio_id = $1 GROUP BY tipo',
      [estudio_id]
    );
    return result.rows;
  },
};

module.exports = PlantillaConsentimiento;
