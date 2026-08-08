const Aguja = require('../models/aguja');

const getAgujas = async (req, res) => {
  try {
    const agujas = await Aguja.buscarTodas(req.query);
    res.json(agujas);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getCaducidadProxima = async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 30;
    const agujas = await Aguja.buscarProximasCaducidad(dias);
    res.json(agujas);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAguja = async (req, res) => {
  try {
    const a = await Aguja.buscarPorId(req.params.id);
    if (!a) return res.status(404).json({ error: 'Aguja no encontrada' });
    res.json(a);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const createAguja = async (req, res) => {
  try {
    const a = await Aguja.crear(req.body);
    res.status(201).json(a);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateAguja = async (req, res) => {
  try {
    const a = await Aguja.actualizar(req.params.id, req.body);
    if (!a) return res.status(404).json({ error: 'Aguja no encontrada' });
    res.json(a);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteAguja = async (req, res) => {
  try {
    const a = await Aguja.desactivar(req.params.id);
    if (!a) return res.status(404).json({ error: 'Aguja no encontrada' });
    res.json(a);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getDefectosArtista = async (req, res) => {
  try {
    const agujas = await Aguja.getDefectosArtista(req.params.empleado_id);
    res.json(agujas);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const addDefectoArtista = async (req, res) => {
  try {
    await Aguja.addDefectoArtista(req.params.empleado_id, req.body.aguja_id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const removeDefectoArtista = async (req, res) => {
  try {
    await Aguja.removeDefectoArtista(req.params.empleado_id, req.params.aguja_id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAgujas, getCaducidadProxima, getAguja, createAguja, updateAguja, deleteAguja,
  getDefectosArtista, addDefectoArtista, removeDefectoArtista };
