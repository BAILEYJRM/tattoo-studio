const cron = require('node-cron');
const pool = require('../config/database');
const {
  enviarRecordatorioCita,
  enviarCuidadosPostServicio,
  enviarCumpleanos,
} = require('./emailService');

// ── 09:00 — Recordatorios citas de mañana ────────────────────────────────────
cron.schedule('0 9 * * *', async () => {
  console.log('[cron] Enviando recordatorios de citas para mañana...');
  try {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fechaStr = manana.toISOString().split('T')[0];

    const res = await pool.query(
      `SELECT c.id FROM citas c
       JOIN clientes cl ON cl.id = c.cliente_id
       WHERE c.fecha = $1
         AND c.estado IN ('pendiente','confirmada')
         AND cl.email IS NOT NULL AND cl.email <> ''
         AND NOT EXISTS (
           SELECT 1 FROM comunicaciones_enviadas ce
           WHERE ce.cita_id = c.id AND ce.tipo = 'recordatorio_cita' AND ce.estado = 'enviado'
         )`,
      [fechaStr]
    );

    for (const row of res.rows) {
      await enviarRecordatorioCita(row.id);
    }
    console.log(`[cron] Recordatorios: ${res.rows.length} procesados`);
  } catch (err) {
    console.error('[cron] Error recordatorios:', err.message);
  }
});

// ── 21:00 — Cuidados post-servicio de citas completadas hoy ──────────────────
cron.schedule('0 21 * * *', async () => {
  console.log('[cron] Enviando cuidados post-servicio...');
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const res = await pool.query(
      `SELECT c.id FROM citas c
       JOIN clientes cl ON cl.id = c.cliente_id
       WHERE c.fecha = $1
         AND c.estado = 'completada'
         AND cl.email IS NOT NULL AND cl.email <> ''
         AND NOT EXISTS (
           SELECT 1 FROM comunicaciones_enviadas ce
           WHERE ce.cita_id = c.id AND ce.tipo IN ('cuidados_tatuaje','cuidados_piercing') AND ce.estado = 'enviado'
         )`,
      [hoy]
    );

    for (const row of res.rows) {
      await enviarCuidadosPostServicio(row.id);
    }
    console.log(`[cron] Cuidados: ${res.rows.length} procesados`);
  } catch (err) {
    console.error('[cron] Error cuidados:', err.message);
  }
});

// ── 10:00 — Felicitaciones de cumpleaños ─────────────────────────────────────
cron.schedule('0 10 * * *', async () => {
  console.log('[cron] Enviando felicitaciones de cumpleaños...');
  try {
    const res = await pool.query(
      `SELECT id FROM clientes
       WHERE email IS NOT NULL AND email <> ''
         AND fecha_nacimiento IS NOT NULL
         AND EXTRACT(MONTH FROM fecha_nacimiento) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(DAY   FROM fecha_nacimiento) = EXTRACT(DAY   FROM CURRENT_DATE)
         AND NOT EXISTS (
           SELECT 1 FROM comunicaciones_enviadas ce
           WHERE ce.cliente_id = clientes.id
             AND ce.tipo = 'cumpleanos'
             AND DATE(ce.enviado_en) = CURRENT_DATE
         )`
    );

    for (const row of res.rows) {
      await enviarCumpleanos(row.id);
    }
    console.log(`[cron] Cumpleaños: ${res.rows.length} procesados`);
  } catch (err) {
    console.error('[cron] Error cumpleaños:', err.message);
  }
});

console.log('[cron] Tareas programadas iniciadas');
