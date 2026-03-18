const pool = require('../config/database');
const {
  enviarConfirmacionCita,
  enviarRecordatorioCita,
  enviarCuidadosPostServicio,
  enviarCumpleanos,
  enviarConsentimientoFirmado,
} = require('../services/emailService');

const getComunicaciones = async (req, res) => {
  try {
    const { tipo, estado, fecha_inicio, fecha_fin } = req.query;
    const conditions = [];
    const values = [];

    if (tipo) { values.push(tipo); conditions.push(`ce.tipo = $${values.length}`); }
    if (estado) { values.push(estado); conditions.push(`ce.estado = $${values.length}`); }
    if (fecha_inicio) { values.push(fecha_inicio); conditions.push(`DATE(ce.created_at) >= $${values.length}`); }
    if (fecha_fin) { values.push(fecha_fin); conditions.push(`DATE(ce.created_at) <= $${values.length}`); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const result = await pool.query(
      `SELECT ce.*,
              cl.nombre || ' ' || cl.apellidos AS cliente_nombre
       FROM comunicaciones_enviadas ce
       LEFT JOIN clientes cl ON cl.id = ce.cliente_id
       ${where}
       ORDER BY ce.created_at DESC
       LIMIT 200`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPlantillas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM plantillas_comunicacion ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePlantilla = async (req, res) => {
  try {
    const { asunto, contenido, activa } = req.body;
    const result = await pool.query(
      `UPDATE plantillas_comunicacion SET asunto = $1, contenido = $2, activa = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [asunto, contenido, activa !== undefined ? activa : true, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const enviarManual = async (req, res) => {
  try {
    const { tipo, cita_id, cliente_id, consentimiento_id } = req.body;
    let ok = false;

    switch (tipo) {
      case 'confirmacion_cita':
        if (!cita_id) return res.status(400).json({ error: 'cita_id requerido' });
        ok = await enviarConfirmacionCita(cita_id);
        break;
      case 'recordatorio_cita':
        if (!cita_id) return res.status(400).json({ error: 'cita_id requerido' });
        ok = await enviarRecordatorioCita(cita_id);
        break;
      case 'cuidados_tatuaje':
      case 'cuidados_piercing':
        if (!cita_id) return res.status(400).json({ error: 'cita_id requerido' });
        ok = await enviarCuidadosPostServicio(cita_id);
        break;
      case 'cumpleanos':
        if (!cliente_id) return res.status(400).json({ error: 'cliente_id requerido' });
        ok = await enviarCumpleanos(cliente_id);
        break;
      case 'consentimiento_firmado':
        if (!consentimiento_id) return res.status(400).json({ error: 'consentimiento_id requerido' });
        ok = await enviarConsentimientoFirmado(consentimiento_id);
        break;
      default:
        return res.status(400).json({ error: `Tipo desconocido: ${tipo}` });
    }

    if (ok) res.json({ ok: true, mensaje: 'Email enviado correctamente' });
    else res.status(422).json({ ok: false, mensaje: 'No se pudo enviar (sin email o plantilla inactiva)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEstadisticas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)                              AS enviados_hoy,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')               AS enviados_semana,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())) AS enviados_mes,
        COUNT(*) FILTER (WHERE estado = 'enviado')                                           AS total_ok,
        COUNT(*) FILTER (WHERE estado = 'error')                                             AS total_error,
        COUNT(*)                                                                              AS total
      FROM comunicaciones_enviadas
    `);
    const stats = result.rows[0];
    stats.tasa_exito = stats.total > 0
      ? Math.round((stats.total_ok / stats.total) * 100)
      : 100;
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getComunicaciones, getPlantillas, updatePlantilla, enviarManual, getEstadisticas };
