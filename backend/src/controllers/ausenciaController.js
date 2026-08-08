const Ausencia = require('../models/ausencia');

const crearAusencia = async (req, res) => {
  try {
    const ausencia = await Ausencia.crear({ ...req.body, empleado_id: req.params.id });
    res.status(201).json(ausencia);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAusencias = async (req, res) => {
  try {
    const ausencias = await Ausencia.buscarPorEmpleado(req.params.id);
    res.json(ausencias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const eliminarAusencia = async (req, res) => {
  try {
    const ausencia = await Ausencia.eliminar(req.params.id);
    if (!ausencia) return res.status(404).json({ error: 'Ausencia no encontrada' });
    res.json(ausencia);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAusenciasRango = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const ausencias = await Ausencia.buscarRango({ fecha_inicio, fecha_fin });
    res.json(ausencias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { crearAusencia, getAusencias, eliminarAusencia, getAusenciasRango };
