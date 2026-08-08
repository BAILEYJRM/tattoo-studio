const path = require('path');
const Incidencia = require('../models/incidencia');

const getIncidencias = async (req, res) => {
  try { res.json(await Incidencia.buscarTodas(req.query)); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

const crearIncidencia = async (req, res) => {
  try {
    const foto_path = req.file
      ? `uploads/incidencias/${req.file.filename}`
      : null;
    const datos = {
      ...req.body,
      empleado_id: req.usuario.id,
      foto_path,
      fecha: req.body.fecha || new Date().toISOString().split('T')[0],
    };
    res.status(201).json(await Incidencia.crear(datos));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const resolver = async (req, res) => {
  try {
    const i = await Incidencia.resolver(req.params.id);
    if (!i) return res.status(404).json({ error: 'Incidencia no encontrada' });
    res.json(i);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const actualizarIncidencia = async (req, res) => {
  try {
    const i = await Incidencia.actualizar(req.params.id, req.body);
    if (!i) return res.status(404).json({ error: 'Incidencia no encontrada' });
    res.json(i);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getIncidencias, crearIncidencia, resolver, actualizarIncidencia };
