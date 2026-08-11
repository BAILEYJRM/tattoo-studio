const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/superadminAuth');
const SuperAdminModel = require('../models/superadmin');

// Aplicar autenticación JWT y filtro de SuperAdmin a todas las rutas
router.use(auth);
router.use(requireSuperAdmin);

// GET /api/superadmin/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await SuperAdminModel.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/superadmin/estudios
router.get('/estudios', async (req, res) => {
  try {
    const estudios = await SuperAdminModel.getAllEstudios();
    res.json(estudios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/superadmin/estudios/:id/plan
router.put('/estudios/:id/plan', async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan) return res.status(400).json({ error: 'Plan requerido' });
    const actualizado = await SuperAdminModel.updatePlan(req.params.id, plan);
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/superadmin/estudios/:id/estado
router.put('/estudios/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ error: 'Estado requerido' });
    const actualizado = await SuperAdminModel.updateEstado(req.params.id, estado);
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/superadmin/estudios/:id/ampliar-prueba
router.put('/estudios/:id/ampliar-prueba', async (req, res) => {
  try {
    const dias = req.body.dias || 14;
    const actualizado = await SuperAdminModel.ampliarPrueba(req.params.id, dias);
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/superadmin/estudios/:id/reset-password
router.post('/estudios/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }
    const result = await SuperAdminModel.resetPasswordEstudio(req.params.id, newPassword);
    res.json({ ok: true, mensaje: `Contraseña de admin reiniciada con éxito para ${result.length} usuario(s).`, usuarios: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
