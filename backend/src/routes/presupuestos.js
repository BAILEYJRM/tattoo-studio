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
    const pool = require('../config/database');
    const presupuestoActualizado = await Presupuesto.actualizar(req.params.id, req.body);
    await logActivity(req.user?.id || null, 'presupuesto', presupuestoActualizado.id, 'actualizado', { data: req.body });

    // Si el presupuesto ha sido marcado como 'Aceptado' y tiene proyecto vinculado, actualizar el proyecto a 'Aprobado'
    if (presupuestoActualizado.estado === 'Aceptado' && presupuestoActualizado.proyecto_id) {
      await pool.query(
        `UPDATE proyectos SET estado = 'Aprobado' WHERE id = $1`,
        [presupuestoActualizado.proyecto_id]
      );
      await logActivity(req.user?.id || null, 'proyecto', presupuestoActualizado.proyecto_id, 'aprobado_via_presupuesto', { presupuestoId: presupuestoActualizado.id });
    }

    res.json(presupuestoActualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Generar token público para compartir presupuesto ──
router.post('/:id/token', async (req, res) => {
  try {
    const pool = require('../config/database');
    const { generateToken } = require('../utils/tokenGenerator');

    // Verificar que el presupuesto existe
    const presupuesto = await Presupuesto.buscarPorId(req.params.id);
    if (!presupuesto) return res.status(404).json({ error: 'Presupuesto no encontrado' });

    // Generar token seguro
    const token = generateToken();
    // Expiración: 30 días por defecto
    const fechaExpiracion = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO quote_tokens (presupuesto_id, token, fecha_expiracion)
       VALUES ($1, $2, $3)
       ON CONFLICT (presupuesto_id) DO UPDATE SET token = $2, fecha_expiracion = $3
       RETURNING *`,
      [req.params.id, token, fechaExpiracion]
    );

    await logActivity(req.user?.id || null, 'presupuesto', presupuesto.id, 'token_generado', { token });

    res.json({ token, fecha_expiracion: fechaExpiracion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Vista pública del presupuesto (sin autenticación) ──
router.get('/public/:token', async (req, res) => {
  try {
    const pool = require('../config/database');
    const tokenResult = await pool.query(
      `SELECT qt.*, p.*
       FROM quote_tokens qt
       JOIN presupuestos p ON p.id = qt.presupuesto_id
       WHERE qt.token = $1`,
      [req.params.token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({ error: 'Presupuesto no encontrado o token inválido' });
    }

    const row = tokenResult.rows[0];

    // Verificar expiración
    if (row.fecha_expiracion && new Date(row.fecha_expiracion) < new Date()) {
      return res.status(410).json({ error: 'Este enlace de presupuesto ha expirado' });
    }

    // Devolver solo campos públicos (sin notas internas ni IDs sensibles)
    res.json({
      servicios: row.servicios,
      sesiones_estimadas: row.sesiones_estimadas,
      precio_por_sesion: row.precio_por_sesion,
      horas_estimadas: row.horas_estimadas,
      precio_fijo: row.precio_fijo,
      descuento: row.descuento,
      impuesto: row.impuesto,
      deposito_requerido: row.deposito_requerido,
      total_estimado: row.total_estimado,
      observaciones: row.observaciones,
      condiciones: row.condiciones,
      politica_cancelacion: row.politica_cancelacion,
      estado: row.estado,
      fecha: row.fecha,
      validez: row.validez,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
