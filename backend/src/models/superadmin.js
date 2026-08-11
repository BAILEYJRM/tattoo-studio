const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class SuperAdminModel {
  static async getStats() {
    const estudiosRes = await pool.query(`
      SELECT 
        COUNT(*) as total_estudios,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
        COUNT(CASE WHEN estado = 'suspendido' THEN 1 END) as suspendidos,
        COUNT(CASE WHEN trial_ends_at > NOW() THEN 1 END) as en_prueba
      FROM estudios
    `);

    const artistasRes = await pool.query(`
      SELECT COUNT(*) as total_artistas FROM empleados WHERE rol = 'artista' AND activo = true
    `);

    const mrrRes = await pool.query(`
      SELECT plan, COUNT(*) as cantidad FROM estudios WHERE estado = 'activo' GROUP BY plan
    `);

    let mrrEstimado = 0;
    mrrRes.rows.forEach(r => {
      const cant = parseInt(r.cantidad);
      if (r.plan === 'anual') mrrEstimado += cant * 37.5; // 450€ / 12
      else if (r.plan === 'semestral') mrrEstimado += cant * 41.6; // 250€ / 6
      else mrrEstimado += cant * 50; // 50€/mes por defecto
    });

    return {
      ...estudiosRes.rows[0],
      total_artistas: parseInt(artistasRes.rows[0]?.total_artistas || 0),
      mrr_estimado: Math.round(mrrEstimado)
    };
  }

  static async getAllEstudios() {
    const result = await pool.query(`
      SELECT 
        e.*,
        COUNT(DISTINCT emp.id) as total_empleados,
        (SELECT COUNT(*) FROM citas c WHERE c.estudio_id = e.id) as total_citas
      FROM estudios e
      LEFT JOIN empleados emp ON emp.estudio_id = e.id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `);
    return result.rows;
  }

  static async updatePlan(estudio_id, plan) {
    const result = await pool.query(
      `UPDATE estudios SET plan = $1 WHERE id = $2 RETURNING *`,
      [plan, estudio_id]
    );
    return result.rows[0];
  }

  static async updateEstado(estudio_id, estado) {
    const result = await pool.query(
      `UPDATE estudios SET estado = $1 WHERE id = $2 RETURNING *`,
      [estado, estudio_id]
    );
    return result.rows[0];
  }

  static async ampliarPrueba(estudio_id, dias = 14) {
    const result = await pool.query(
      `UPDATE estudios 
       SET trial_ends_at = GREATEST(COALESCE(trial_ends_at, NOW()), NOW()) + INTERVAL '${parseInt(dias)} days',
           estado = 'activo'
       WHERE id = $1 RETURNING *`,
      [estudio_id]
    );
    return result.rows[0];
  }

  static async resetPasswordEstudio(estudio_id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      `UPDATE empleados SET password = $1 
       WHERE estudio_id = $2 AND rol = 'admin' 
       RETURNING id, email, nombre`,
      [hashed, estudio_id]
    );
    return result.rows;
  }
}

module.exports = SuperAdminModel;
