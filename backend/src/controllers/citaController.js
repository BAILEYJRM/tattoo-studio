 
const Cita = require('../models/cita');

const getCitas = async (req, res) => {
  try {
    const { fecha, artista_id } = req.query;
    let citas;
    if (fecha) citas = await Cita.buscarPorFecha(fecha);
    else if (artista_id) citas = await Cita.buscarPorArtista(artista_id);
    else citas = await Cita.buscarTodas();
    res.json(citas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCita = async (req, res) => {
  try {
    const cita = await Cita.buscarPorId(req.params.id);
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(cita);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearCita = async (req, res) => {
  try {
    const cita = await Cita.crear(req.body);
    res.status(201).json(cita);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarCita = async (req, res) => {
  try {
    const cita = await Cita.actualizar(req.params.id, req.body);
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(cita);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const estados = ['pendiente', 'confirmada', 'completada', 'cancelada'];
    if (!estados.includes(estado)) return res.status(400).json({ error: 'Estado no válido' });
    const cita = await Cita.actualizarEstado(req.params.id, estado);
    res.json(cita);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getCitas, getCita, crearCita, actualizarCita, actualizarEstado };