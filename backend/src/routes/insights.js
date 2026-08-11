const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener resumen de métricas e inteligencia comercial
router.get('/resumen', async (req, res) => {
  try {
    // 1. Embudo de ventas (Funnel por estado de Leads)
    const funnelResult = await pool.query(`
      SELECT estado, COUNT(*) as cantidad
      FROM leads
      GROUP BY estado
    `);

    // 2. Leads por origen/canal
    const origenResult = await pool.query(`
      SELECT COALESCE(origen, 'Sin especificar') as origen, COUNT(*) as cantidad
      FROM leads
      GROUP BY origen
      ORDER BY cantidad DESC
    `);

    // 3. Proyectos por estado e ingresos potenciales
    const proyectosResult = await pool.query(`
      SELECT estado, COUNT(*) as cantidad, SUM(COALESCE(precio_estimado, 0)) as total_estimado
      FROM proyectos
      GROUP BY estado
    `);

    // 4. Motivos de pérdida recurrentes
    const motivosResult = await pool.query(`
      SELECT motivo, COUNT(*) as cantidad
      FROM seguimientos
      WHERE estado = 'Cancelado' OR motivo IS NOT NULL
      GROUP BY motivo
      ORDER BY cantidad DESC
      LIMIT 5
    `);

    // 5. Total de presupuestos aceptados vs pendientes
    const presupuestosResult = await pool.query(`
      SELECT estado, COUNT(*) as cantidad, SUM(COALESCE(total_estimado, 0)) as monto
      FROM presupuestos
      GROUP BY estado
    `);

    res.json({
      funnel: funnelResult.rows,
      origenes: origenResult.rows,
      proyectos: proyectosResult.rows,
      motivosPerdida: motivosResult.rows,
      presupuestos: presupuestosResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
