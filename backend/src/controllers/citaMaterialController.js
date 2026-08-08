const CitaMaterial = require('../models/citaMaterial');

const getMaterialCita = async (req, res) => {
  try {
    const material = await CitaMaterial.getMaterialCita(req.params.id);
    res.json(material);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const registrarMaterial = async (req, res) => {
  try {
    const item = await CitaMaterial.registrarMaterial(req.params.id, req.body);
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const eliminarMaterial = async (req, res) => {
  try {
    await CitaMaterial.eliminarMaterial(req.params.material_id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getMaterialCita, registrarMaterial, eliminarMaterial };
