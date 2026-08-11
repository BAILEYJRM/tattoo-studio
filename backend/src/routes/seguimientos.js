const express = require('express');
const router = express.Router();
const Seguimiento = require('../models/seguimiento');
const { logActivity } = require('../utils/activityLogger');

// Obtener todos los seguimientos
router.get('/', async (req, res) => {
  try {
    const seguimientos = await Seguimiento.buscarTodos();
    res.json(seguimientos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener seguimiento por ID
router.get('/:id', async (req, res) => {
  try {
    const seguimiento = await Seguimiento.buscarPorId(req.params.id);
    if (!seguimiento) return res.status(404).json({ error: 'Seguimiento no encontrado' });
    res.json(seguimiento);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo seguimiento
router.post('/', async (req, res) => {
  try {
    const nuevo = await Seguimiento.crear(req.body);
    await logActivity(req.user?.id || null, 'seguimiento', nuevo.id, 'creado', { data: req.body });
    res.status(201).json(nuevo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar seguimiento existente
router.put('/:id', async (req, res) => {
  try {
    const actualizado = await Seguimiento.actualizar(req.params.id, req.body);
    await logActivity(req.user?.id || null, 'seguimiento', actualizado.id, 'actualizado', { data: req.body });
    res.json(actualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
