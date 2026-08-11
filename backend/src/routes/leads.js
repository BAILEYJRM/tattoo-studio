const express = require('express');
const router = express.Router();
const Lead = require('../models/lead');
const { logActivity } = require('../utils/activityLogger');

// Obtener todos los leads
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.buscarTodos();
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener lead por ID
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.buscarPorId(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo lead
router.post('/', async (req, res) => {
  try {
    const nuevoLead = await Lead.crear(req.body);
    // Auditoría
    await logActivity(req.user?.id || null, 'lead', nuevoLead.id, 'creado', { data: req.body });
    res.status(201).json(nuevoLead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar lead existente
router.put('/:id', async (req, res) => {
  try {
    const leadActualizado = await Lead.actualizar(req.params.id, req.body);
    await logActivity(req.user?.id || null, 'lead', leadActualizado.id, 'actualizado', { data: req.body });
    res.json(leadActualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
