const Recibo = require('../models/recibo');

const getRecibos = async (req, res) => {
  try {
    const recibos = await Recibo.buscarTodos(req.query, req.usuario.estudio_id);
    res.json(recibos);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getRecibo = async (req, res) => {
  try {
    const recibo = await Recibo.buscarPorId(req.params.id, req.usuario.estudio_id);
    if (!recibo) return res.status(404).json({ error: 'Recibo no encontrado' });
    res.json(recibo);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const crearRecibo = async (req, res) => {
  try {
    const recibo = await Recibo.crear(req.body, req.usuario.estudio_id);
    // Generar PDF automáticamente
    try { await Recibo.generarPDF(recibo.id, req.usuario.estudio_id); } catch (e) { console.error('PDF error:', e.message); }
    const reciboConPdf = await Recibo.buscarPorId(recibo.id, req.usuario.estudio_id);
    res.status(201).json(reciboConPdf);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const regenerarPdf = async (req, res) => {
  try {
    const recibo = await Recibo.generarPDF(req.params.id, req.usuario.estudio_id);
    res.json(recibo);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getRecibos, getRecibo, crearRecibo, regenerarPdf };
