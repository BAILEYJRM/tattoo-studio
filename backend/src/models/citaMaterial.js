const pool = require('../config/database');

const CitaMaterial = {
  registrarMaterial: async (cita_id, d, estudio_id) => {
    // Verificar que la cita pertenezca al estudio
    const citaCheck = await pool.query('SELECT id FROM citas WHERE id = $1 AND estudio_id = $2', [cita_id, estudio_id]);
    if (citaCheck.rows.length === 0) throw new Error('Cita no encontrada en el estudio');

    const r = await pool.query(
      `INSERT INTO cita_material (cita_id, tipo, tinta_id, aguja_id, cantidad, notas)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [cita_id, d.tipo, d.tinta_id||null, d.aguja_id||null, d.cantidad||null, d.notas||null]
    );
    return r.rows[0];
  },

  getMaterialCita: async (cita_id, estudio_id) => {
    const r = await pool.query(
      `SELECT cm.*,
              t.nombre AS tinta_nombre, t.color AS tinta_color, t.marca AS tinta_marca,
              ag.marca AS aguja_marca, ag.modelo AS aguja_modelo, ag.tipo AS aguja_tipo
       FROM cita_material cm
       JOIN citas c ON c.id = cm.cita_id
       LEFT JOIN tintas t ON t.id = cm.tinta_id
       LEFT JOIN agujas ag ON ag.id = cm.aguja_id
       WHERE cm.cita_id = $1 AND c.estudio_id = $2
       ORDER BY cm.created_at`,
      [cita_id, estudio_id]
    );
    return r.rows;
  },

  eliminarMaterial: async (id, estudio_id) => {
    await pool.query(
      `DELETE FROM cita_material cm
       USING citas c
       WHERE cm.cita_id = c.id AND cm.id = $1 AND c.estudio_id = $2`,
      [id, estudio_id]
    );
  },
};

module.exports = CitaMaterial;
