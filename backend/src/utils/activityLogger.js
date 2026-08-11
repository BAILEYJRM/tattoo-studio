const pool = require('../config/database');

/**
 * Register an activity in the activity timeline.
 * @param {number} usuarioId - ID of the employee performing the action.
 * @param {string} entidadTipo - Type of entity (e.g., 'lead', 'proyecto', 'presupuesto').
 * @param {number} entidadId - Primary key of the entity.
 * @param {string} accion - Action description (e.g., 'creado', 'actualizado').
 * @param {object} detalle - Additional details, stored as JSONB.
 */
async function logActivity(usuarioId, entidadTipo, entidadId, accion, detalle = {}) {
  await pool.query(
    `INSERT INTO actividad (entidad_tipo, entidad_id, usuario_id, accion, detalle) VALUES ($1,$2,$3,$4,$5)`,
    [entidadTipo, entidadId, usuarioId, accion, JSON.stringify(detalle)]
  );
}

module.exports = { logActivity };
