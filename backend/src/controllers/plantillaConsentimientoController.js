const PlantillaConsentimiento = require('../models/plantillaConsentimiento');

const getPlantillas = async (req, res) => {
  try {
    const { tipo } = req.query;
    const plantillas = tipo
      ? await PlantillaConsentimiento.buscarPorTipo(tipo)
      : await PlantillaConsentimiento.buscarTodas();
    res.json(plantillas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPlantilla = async (req, res) => {
  try {
    const plantilla = await PlantillaConsentimiento.buscarPorId(req.params.id);
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(plantilla);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearPlantilla = async (req, res) => {
  try {
    const plantilla = await PlantillaConsentimiento.crear(req.body);
    res.status(201).json(plantilla);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarPlantilla = async (req, res) => {
  try {
    const plantilla = await PlantillaConsentimiento.actualizar(req.params.id, req.body);
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(plantilla);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPlantillas, getPlantilla, crearPlantilla, actualizarPlantilla };
