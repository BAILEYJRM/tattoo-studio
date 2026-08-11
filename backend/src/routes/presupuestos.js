const express = require('express');
const router = express.Router();
const Presupuesto = require('../models/presupuesto');
const { logActivity } = require('../utils/activityLogger');

// Obtener todos los presupuestos
router.get('/', async (req, res) => {
  try {
    const presupuestos = await Presupuesto.buscarTodos();
    res.json(presupuestos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener presupuesto por ID
router.get('/:id', async (req, res) => {
  try {
    const presupuesto = await Presupuesto.buscarPorId(req.params.id);
    if (!presupuesto) return res.status(404).json({ error: 'Presupuesto no encontrado' });
    res.json(presupuesto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo presupuesto
router.post('/', async (req, res) => {
  try {
    const nuevoPresupuesto = await Presupuesto.crear(req.body);
    await logActivity(req.user?.id || null, 'presupuesto', nuevoPresupuesto.id, 'creado', { data: req.body });
    res.status(201).json(nuevoPresupuesto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar presupuesto existente
router.put('/:id', async (req, res) => {
  try {
    const presupuestoActualizado = await Presupuesto.actualizar(req.params.id, req.body);
    await logActivity(req.user?.id || null, 'presupuesto', presupuestoActualizado.id, 'actualizado', { data: req.body });
    res.json(presupuestoActualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
