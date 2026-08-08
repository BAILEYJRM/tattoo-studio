const pool = require('../config/database');

const CitaMaterial = {
  registrarMaterial: async (cita_id, d) => {
    const r = await pool.query(
      `INSERT INTO cita_material (cita_id, tipo, tinta_id, aguja_id, cantidad, notas)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [cita_id, d.tipo, d.tinta_id||null, d.aguja_id||null, d.cantidad||null, d.notas||null]
    );
    return r.rows[0];
  },

  getMaterialCita: async (cita_id) => {
    const r = await pool.query(
      `SELECT cm.*,
              t.nombre AS tinta_nombre, t.color AS tinta_color, t.marca AS tinta_marca,
              ag.marca AS aguja_marca, ag.modelo AS aguja_modelo, ag.tipo AS aguja_tipo
       FROM cita_material cm
       LEFT JOIN tintas t ON t.id = cm.tinta_id
       LEFT JOIN agujas ag ON ag.id = cm.aguja_id
       WHERE cm.cita_id = $1
       ORDER BY cm.created_at`,
      [cita_id]
    );
    return r.rows;
  },

  eliminarMaterial: async (id) => {
    await pool.query('DELETE FROM cita_material WHERE id = $1', [id]);
  },
};

module.exports = CitaMaterial;
