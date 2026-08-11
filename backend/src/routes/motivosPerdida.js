const express = require('express');
const router = express.Router();
const MotivoPerdida = require('../models/motivoPerdida');

// Obtener todos los motivos de pérdida (si está vacío, siembra los por defecto)
router.get('/', async (req, res) => {
  try {
    await MotivoPerdida.sembrarPorDefecto();
    const motivos = await MotivoPerdida.obtenerTodos();
    res.json(motivos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo motivo de pérdida
router.post('/', async (req, res) => {
  try {
    const { descripcion } = req.body;
    if (!descripcion) return res.status(400).json({ error: 'La descripción es requerida' });
    const nuevo = await MotivoPerdida.crear(descripcion);
    res.status(201).json(nuevo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
