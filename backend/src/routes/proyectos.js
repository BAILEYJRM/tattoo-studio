const express = require('express');
const router = express.Router();
const Proyecto = require('../models/proyecto');
const { logActivity } = require('../utils/activityLogger');

// Obtener todos los proyectos
router.get('/', async (req, res) => {
  try {
    const proyectos = await Proyecto.buscarTodos();
    res.json(proyectos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener proyecto por ID
router.get('/:id', async (req, res) => {
  try {
    const proyecto = await Proyecto.buscarPorId(req.params.id);
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(proyecto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo proyecto
router.post('/', async (req, res) => {
  try {
    const nuevoProyecto = await Proyecto.crear(req.body);
    await logActivity(req.user?.id || null, 'proyecto', nuevoProyecto.id, 'creado', { data: req.body });
    res.status(201).json(nuevoProyecto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar proyecto existente
router.put('/:id', async (req, res) => {
  try {
    const proyectoActualizado = await Proyecto.actualizar(req.params.id, req.body);
    await logActivity(req.user?.id || null, 'proyecto', proyectoActualizado.id, 'actualizado', { data: req.body });
    res.json(proyectoActualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
