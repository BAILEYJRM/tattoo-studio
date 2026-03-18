const { Resend } = require('resend');
const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@tattoo-studio.com';

async function getEstudioConfig() {
  try {
    const res = await pool.query(
      "SELECT clave, valor FROM configuracion_estudio WHERE clave IN ('estudio_nombre', 'estudio_email')"
    );
    const cfg = {};
    res.rows.forEach(r => { cfg[r.clave] = r.valor; });
    return {
      nombre: cfg.estudio_nombre || process.env.ESTUDIO_NOMBRE || 'Tattoo Studio',
      email: cfg.estudio_email || process.env.ESTUDIO_EMAIL || null,
    };
  } catch {
    return {
      nombre: process.env.ESTUDIO_NOMBRE || 'Tattoo Studio',
      email: process.env.ESTUDIO_EMAIL || null,
    };
  }
}

// ── Registro en BD ────────────────────────────────────────────────────────────
async function registrarEnvio({ tipo, canal = 'email', cliente_id, cita_id, asunto, destinatario, estado, enviado_en }) {
  await pool.query(
    `INSERT INTO comunicaciones_enviadas (tipo, canal, cliente_id, cita_id, asunto, destinatario, estado, enviado_en)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [tipo, canal, cliente_id || null, cita_id || null, asunto, destinatario, estado, enviado_en || null]
  );
}

// ── Enviar email base ─────────────────────────────────────────────────────────
async function enviarEmail({ to, subject, html, tipo, cliente_id, cita_id, attachments }) {
  try {
    const payload = { from: EMAIL_FROM, to, subject, html };
    if (attachments) payload.attachments = attachments;
    await resend.emails.send(payload);
    await registrarEnvio({ tipo, cliente_id, cita_id, asunto: subject, destinatario: to, estado: 'enviado', enviado_en: new Date() });
    return true;
  } catch (err) {
    console.error(`[email] Error enviando a ${to}:`, err.message);
    await registrarEnvio({ tipo, cliente_id, cita_id, asunto: subject, destinatario: to, estado: 'error', enviado_en: new Date() });
    return false;
  }
}

// ── Procesar plantilla ────────────────────────────────────────────────────────
async function procesarPlantilla(tipo, variables) {
  const res = await pool.query('SELECT * FROM plantillas_comunicacion WHERE tipo = $1 AND activa = true', [tipo]);
  if (!res.rows[0]) return null;
  const { asunto, contenido } = res.rows[0];

  const reemplazar = (str) =>
    str.replace(/\{\{(\w+)\}\}/g, (_, k) => variables[k] !== undefined ? variables[k] : `{{${k}}}`);

  return { asunto: reemplazar(asunto), contenido: reemplazar(contenido) };
}

// ── Helpers de formato ────────────────────────────────────────────────────────
function fmtFecha(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function textoHtml(texto, estudioNombre) {
  const nombre = estudioNombre || process.env.ESTUDIO_NOMBRE || 'Tattoo Studio';
  return `<html><body style="font-family:Arial,sans-serif;color:#222;max-width:600px;margin:auto;padding:24px">
    <div style="background:#1a1a2e;padding:20px 24px;border-radius:8px;margin-bottom:24px">
      <h2 style="color:#fff;margin:0;font-size:18px">${nombre}</h2>
    </div>
    <div style="white-space:pre-line;line-height:1.7;font-size:15px">${texto.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  </body></html>`;
}

// ── obtener datos de cita ─────────────────────────────────────────────────────
async function getDatosCita(cita_id) {
  const res = await pool.query(
    `SELECT c.*, cl.nombre || ' ' || cl.apellidos AS cliente_nombre, cl.email AS cliente_email,
            e.nombre || ' ' || e.apellidos AS artista_nombre, cab.nombre AS cabina_nombre
     FROM citas c
     LEFT JOIN clientes cl ON cl.id = c.cliente_id
     LEFT JOIN empleados e ON e.id = c.artista_id
     LEFT JOIN cabinas cab ON cab.id = c.cabina_id
     WHERE c.id = $1`,
    [cita_id]
  );
  return res.rows[0] || null;
}

// ── enviarConfirmacionCita ────────────────────────────────────────────────────
async function enviarConfirmacionCita(cita_id) {
  const [cita, estudio] = await Promise.all([getDatosCita(cita_id), getEstudioConfig()]);
  if (!cita || !cita.cliente_email) return false;

  const vars = {
    cliente_nombre: cita.cliente_nombre,
    fecha: fmtFecha(cita.fecha?.split('T')[0]),
    hora_inicio: cita.hora_inicio?.slice(0, 5) || '',
    hora_fin: cita.hora_fin?.slice(0, 5) || '',
    artista_nombre: cita.artista_nombre || '',
    cabina_nombre: cita.cabina_nombre || 'Por asignar',
    precio: cita.precio ? Number(cita.precio).toFixed(2) : '—',
    politica_cancelacion: 'Para cancelar, contáctanos con al menos 24h de antelación.',
    estudio: estudio.nombre,
  };

  const plantilla = await procesarPlantilla('confirmacion_cita', vars);
  if (!plantilla) return false;

  return enviarEmail({
    to: cita.cliente_email,
    subject: plantilla.asunto,
    html: textoHtml(plantilla.contenido, estudio.nombre),
    tipo: 'confirmacion_cita',
    cliente_id: cita.cliente_id,
    cita_id: cita.id,
  });
}

// ── enviarRecordatorioCita ────────────────────────────────────────────────────
async function enviarRecordatorioCita(cita_id) {
  const [cita, estudio] = await Promise.all([getDatosCita(cita_id), getEstudioConfig()]);
  if (!cita || !cita.cliente_email) return false;

  const vars = {
    cliente_nombre: cita.cliente_nombre,
    fecha: fmtFecha(cita.fecha?.split('T')[0]),
    hora_inicio: cita.hora_inicio?.slice(0, 5) || '',
    artista_nombre: cita.artista_nombre || '',
    estudio: estudio.nombre,
  };

  const plantilla = await procesarPlantilla('recordatorio_cita', vars);
  if (!plantilla) return false;

  return enviarEmail({
    to: cita.cliente_email,
    subject: plantilla.asunto,
    html: textoHtml(plantilla.contenido, estudio.nombre),
    tipo: 'recordatorio_cita',
    cliente_id: cita.cliente_id,
    cita_id: cita.id,
  });
}

// ── enviarCuidadosPostServicio ────────────────────────────────────────────────
async function enviarCuidadosPostServicio(cita_id) {
  const [cita, estudio] = await Promise.all([getDatosCita(cita_id), getEstudioConfig()]);
  if (!cita || !cita.cliente_email) return false;

  const desc = (cita.descripcion || '').toLowerCase();
  let tipoCuidados = 'cuidados_tatuaje';
  if (desc.includes('piercing')) tipoCuidados = 'cuidados_piercing';

  const vars = {
    cliente_nombre: cita.cliente_nombre,
    estudio: estudio.nombre,
  };

  const plantilla = await procesarPlantilla(tipoCuidados, vars);
  if (!plantilla) return false;

  return enviarEmail({
    to: cita.cliente_email,
    subject: plantilla.asunto,
    html: textoHtml(plantilla.contenido, estudio.nombre),
    tipo: tipoCuidados,
    cliente_id: cita.cliente_id,
    cita_id: cita.id,
  });
}

// ── enviarCumpleanos ──────────────────────────────────────────────────────────
async function enviarCumpleanos(cliente_id) {
  const [clienteRes, estudio] = await Promise.all([
    pool.query('SELECT * FROM clientes WHERE id = $1', [cliente_id]),
    getEstudioConfig(),
  ]);
  const cliente = clienteRes.rows[0];
  if (!cliente || !cliente.email) return false;

  const vars = {
    cliente_nombre: `${cliente.nombre} ${cliente.apellidos}`,
    estudio: estudio.nombre,
  };

  const plantilla = await procesarPlantilla('cumpleanos', vars);
  if (!plantilla) return false;

  return enviarEmail({
    to: cliente.email,
    subject: plantilla.asunto,
    html: textoHtml(plantilla.contenido, estudio.nombre),
    tipo: 'cumpleanos',
    cliente_id: cliente.id,
  });
}

// ── enviarConsentimientoFirmado ───────────────────────────────────────────────
async function enviarConsentimientoFirmado(consentimiento_id) {
  const [conRes, estudio] = await Promise.all([
    pool.query(
      `SELECT con.*, cl.nombre || ' ' || cl.apellidos AS cliente_nombre, cl.email AS cliente_email
       FROM consentimientos con
       LEFT JOIN clientes cl ON cl.id = con.cliente_id
       WHERE con.id = $1`,
      [consentimiento_id]
    ),
    getEstudioConfig(),
  ]);
  const con = conRes.rows[0];
  if (!con || !con.cliente_email) return false;

  const vars = {
    cliente_nombre: con.cliente_nombre,
    fecha: fmtFecha(con.firmado_en?.toISOString()?.split('T')[0]),
    estudio: estudio.nombre,
  };

  const plantilla = await procesarPlantilla('consentimiento_firmado', vars);
  if (!plantilla) return false;

  const attachments = [];
  if (con.pdf_path) {
    const rutaAbsoluta = path.join(__dirname, '../../', con.pdf_path);
    if (fs.existsSync(rutaAbsoluta)) {
      attachments.push({
        filename: `consentimiento-${con.id}.pdf`,
        content: fs.readFileSync(rutaAbsoluta),
      });
    }
  }

  return enviarEmail({
    to: con.cliente_email,
    subject: plantilla.asunto,
    html: textoHtml(plantilla.contenido, estudio.nombre),
    tipo: 'consentimiento_firmado',
    cliente_id: con.cliente_id,
    attachments: attachments.length ? attachments : undefined,
  });
}

module.exports = {
  enviarEmail,
  procesarPlantilla,
  enviarConfirmacionCita,
  enviarRecordatorioCita,
  enviarCuidadosPostServicio,
  enviarCumpleanos,
  enviarConsentimientoFirmado,
};
