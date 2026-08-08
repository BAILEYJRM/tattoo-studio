const Tinta = require('../models/tinta');

const getTintas = async (req, res) => {
  try {
    const tintas = await Tinta.buscarTodas(req.query);
    res.json(tintas);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getCaducidadProxima = async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 30;
    const tintas = await Tinta.buscarProximasCaducidad(dias);
    res.json(tintas);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getTinta = async (req, res) => {
  try {
    const t = await Tinta.buscarPorId(req.params.id);
    if (!t) return res.status(404).json({ error: 'Tinta no encontrada' });
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const createTinta = async (req, res) => {
  try {
    const t = await Tinta.crear(req.body);
    res.status(201).json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateTinta = async (req, res) => {
  try {
    const t = await Tinta.actualizar(req.params.id, req.body);
    if (!t) return res.status(404).json({ error: 'Tinta no encontrada' });
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteTinta = async (req, res) => {
  try {
    const t = await Tinta.desactivar(req.params.id);
    if (!t) return res.status(404).json({ error: 'Tinta no encontrada' });
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getDefectosArtista = async (req, res) => {
  try {
    const tintas = await Tinta.getDefectosArtista(req.params.empleado_id);
    res.json(tintas);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const addDefectoArtista = async (req, res) => {
  try {
    await Tinta.addDefectoArtista(req.params.empleado_id, req.body.tinta_id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const removeDefectoArtista = async (req, res) => {
  try {
    await Tinta.removeDefectoArtista(req.params.empleado_id, req.params.tinta_id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getTintas, getCaducidadProxima, getTinta, createTinta, updateTinta, deleteTinta,
  getDefectosArtista, addDefectoArtista, removeDefectoArtista };
