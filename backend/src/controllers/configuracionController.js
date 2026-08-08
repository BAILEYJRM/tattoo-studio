const Configuracion = require('../models/configuracion');
const pool = require('../config/database');

async function getConfiguracion(req, res) {
  try {
    const config = await Configuracion.getAll();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateConfiguracion(req, res) {
  try {
    await Configuracion.setMultiple(req.body);
    const config = await Configuracion.getAll();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getConfiguracionPublica(req, res) {
  try {
    const config = await Configuracion.getPublica();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getDiasFestivos(req, res) {
  try {
    const result = await pool.query('SELECT * FROM dias_festivos ORDER BY fecha');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addDiaFestivo(req, res) {
  try {
    const { fecha, descripcion } = req.body;
    const result = await pool.query(
      'INSERT INTO dias_festivos (fecha, descripcion) VALUES ($1, $2) RETURNING *',
      [fecha, descripcion || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Fecha ya registrada como festivo' });
    res.status(500).json({ error: err.message });
  }
}

async function deleteDiaFestivo(req, res) {
  try {
    await pool.query('DELETE FROM dias_festivos WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
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
};
