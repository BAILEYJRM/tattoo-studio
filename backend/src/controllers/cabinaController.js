const Cabina = require('../models/cabina');

const getCabinas = async (req, res) => {
  try { res.json(await Cabina.buscarTodas()); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

const getCabina = async (req, res) => {
  try {
    const c = await Cabina.buscarPorId(req.params.id);
    if (!c) return res.status(404).json({ error: 'Cabina no encontrada' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const crearCabina = async (req, res) => {
  try { res.status(201).json(await Cabina.crear(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

const actualizarCabina = async (req, res) => {
  try {
    const c = await Cabina.actualizar(req.params.id, req.body);
    if (!c) return res.status(404).json({ error: 'Cabina no encontrada' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!['disponible', 'ocupada'].includes(estado))
      return res.status(400).json({ error: 'Estado inválido' });
    const c = await Cabina.cambiarEstado(req.params.id, estado);
    if (!c) return res.status(404).json({ error: 'Cabina no encontrada' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getCabinas, getCabina, crearCabina, actualizarCabina, cambiarEstado };
