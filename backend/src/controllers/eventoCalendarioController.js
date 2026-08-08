const EventoCalendario = require('../models/eventoCalendario');

const getEventos = async (req, res) => {
  try {
    const eventos = await EventoCalendario.buscarTodos(req.query);
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEvento = async (req, res) => {
  try {
    const evento = await EventoCalendario.buscarPorId(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(evento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearEvento = async (req, res) => {
  try {
    const evento = await EventoCalendario.crear(req.body);
    res.status(201).json(evento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarEvento = async (req, res) => {
  try {
    const evento = await EventoCalendario.actualizar(req.params.id, req.body);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(evento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const eliminarEvento = async (req, res) => {
  try {
    const evento = await EventoCalendario.eliminar(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(evento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getEventos, getEvento, crearEvento, actualizarEvento, eliminarEvento };
