const Configuracion = require('../models/configuracion');
const pool = require('../config/database');

async function getConfiguracion(req, res) {
  try {
    const config = await Configuracion.getAll(req.usuario.estudio_id);
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateConfiguracion(req, res) {
  try {
    await Configuracion.setMultiple(req.body, req.usuario.estudio_id);
    const config = await Configuracion.getAll(req.usuario.estudio_id);
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getConfiguracionPublica(req, res) {
  try {
    // Para rutas públicas, el estudio_id se podría pasar por query string si hay múltiples estudios expuestos en landing pages.
    // Si no viene, podríamos usar un estudio por defecto o fallar. Por ahora lo intentamos coger de req.query.estudio_id
    const estudio_id = req.query.estudio_id || 1; // Asumimos 1 por defecto para el landing principal si no se pasa
    const config = await Configuracion.getPublica(estudio_id);
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getDiasFestivos(req, res) {
  try {
    const result = await pool.query('SELECT * FROM dias_festivos WHERE estudio_id = $1 ORDER BY fecha', [req.usuario.estudio_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addDiaFestivo(req, res) {
  try {
    const { fecha, descripcion } = req.body;
    const result = await pool.query(
      'INSERT INTO dias_festivos (fecha, descripcion, estudio_id) VALUES ($1, $2, $3) RETURNING *',
      [fecha, descripcion || null, req.usuario.estudio_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Fecha ya registrada como festivo' });
    res.status(500).json({ error: err.message });
  }
}

async function deleteDiaFestivo(req, res) {
  try {
    await pool.query('DELETE FROM dias_festivos WHERE id = $1 AND estudio_id = $2', [req.params.id, req.usuario.estudio_id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function uploadLogo(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
    const url = `/uploads/logos/${req.file.filename}`;
    const tipo = req.body.tipo || 'theme_logo_url';
    await Configuracion.setMultiple({ [tipo]: url }, req.usuario.estudio_id);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function reiniciarSecuenciaFactura(req, res) {
  try {
    const { numero } = req.body;
    if (!numero || isNaN(numero)) return res.status(400).json({ error: 'Número inválido' });
    
    await pool.query(`ALTER SEQUENCE factura_seq RESTART WITH ${Number(numero)}`);
    res.json({ ok: true, mensaje: `Secuencia reiniciada a ${numero}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getConfiguracion,
  updateConfiguracion,
  getConfiguracionPublica,
  getDiasFestivos,
  addDiaFestivo,
  deleteDiaFestivo,
  uploadLogo,
  reiniciarSecuenciaFactura,
};
