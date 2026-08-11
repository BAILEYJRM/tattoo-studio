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

// Transición automática: Convertir Lead a Cliente y Proyecto
router.post('/:id/convertir', async (req, res) => {
  try {
    const pool = require('../config/database');
    const lead = await Lead.buscarPorId(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });

    let clienteId = lead.cliente_id;

    // 1. Si el lead no tiene cliente vinculado, lo creamos automáticamente
    if (!clienteId) {
      const nuevoClienteRes = await pool.query(
        `INSERT INTO clientes (nombre, email, telefono, instagram, como_nos_conocio)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [lead.nombre, lead.email, lead.telefono, lead.instagram, lead.origen]
      );
      clienteId = nuevoClienteRes.rows[0].id;
    }

    // 2. Crear proyecto automático vinculado
    const nuevoProyectoRes = await pool.query(
      `INSERT INTO proyectos (
        cliente_id, nombre, descripcion, estilo, estado, origen_comercial
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        clienteId,
        `Proyecto: ${lead.nombre}`,
        lead.descripcion || 'Proyecto generado automáticamente desde Lead',
        lead.estilo_solicitado || null,
        'Nuevo',
        lead.origen || 'Lead'
      ]
    );

    const proyectoId = nuevoProyectoRes.rows[0].id;

    // 3. Actualizar estado del lead a 'Convertido'
    const leadConvertido = await Lead.actualizar(lead.id, {
      ...lead,
      estado: 'Convertido',
      cliente_id: clienteId,
      proyecto_id: proyectoId
    });

    await logActivity(req.user?.id || null, 'lead', lead.id, 'convertido_a_cliente_proyecto', { clienteId, proyectoId });

    res.json({
      lead: leadConvertido,
      cliente_id: clienteId,
      proyecto_id: proyectoId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
