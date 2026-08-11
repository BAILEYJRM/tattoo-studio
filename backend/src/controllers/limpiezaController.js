const Limpieza = require('../models/limpieza');

const getLimpiezas = async (req, res) => {
  try { res.json(await Limpieza.buscarTodas(req.query, req.usuario.estudio_id)); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

const getResumenHoy = async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
    res.json(await Limpieza.resumenHoy(fecha, req.usuario.estudio_id));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const crearLimpieza = async (req, res) => {
  try {
    const datos = { ...req.body, empleado_id: req.usuario.id };
    res.status(201).json(await Limpieza.crear(datos, req.usuario.estudio_id));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const actualizarLimpieza = async (req, res) => {
  try {
    const l = await Limpieza.actualizar(req.params.id, req.body, req.usuario.estudio_id);
    if (!l) return res.status(404).json({ error: 'Limpieza no encontrada' });
    res.json(l);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const eliminarLimpieza = async (req, res) => {
  try { await Limpieza.eliminar(req.params.id, req.usuario.estudio_id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getLimpiezas, getResumenHoy, crearLimpieza, actualizarLimpieza, eliminarLimpieza };
