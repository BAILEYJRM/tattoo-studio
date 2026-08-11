const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const auth = require('../middleware/auth'); // Optionally require auth middleware

router.get('/status', syncController.syncStatus);
router.post('/google', syncController.syncGoogle);
router.post('/goldie', syncController.syncGoldie);

// Exportación iCal / ICS Feed para Google Calendar, Apple iCal y Goldie
router.get('/ical/:artistaId.ics', async (req, res) => {
  try {
    const pool = require('../config/database');
    const { artistaId } = req.params;
    const citasRes = await pool.query(
      `SELECT c.*, cl.nombre as cliente_nombre, cl.telefono as cliente_telefono
       FROM citas c
       LEFT JOIN clientes cl ON cl.id = c.cliente_id
       WHERE c.artista_id = $1 AND c.estado != 'cancelada'`,
      [artistaId]
    );

    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KuroIchi Tattoo Studio//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Citas KuroIchi'
    ];

    for (const cita of citasRes.rows) {
      const fechaStr = new Date(cita.fecha).toISOString().slice(0, 10).replace(/-/g, '');
      const horaStart = (cita.hora_inicio || '09:00:00').replace(/:/g, '').slice(0, 6);
      const horaEnd = (cita.hora_fin || '10:00:00').replace(/:/g, '').slice(0, 6);
      
      ics.push(
        'BEGIN:VEVENT',
        `UID:cita-${cita.id}@kuroichi`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
        `DTSTART:${fechaStr}T${horaStart}`,
        `DTEND:${fechaStr}T${horaEnd}`,
        `SUMMARY:Tatuaje - ${cita.cliente_nombre || 'Cliente'}`,
        `DESCRIPTION:${(cita.descripcion || 'Sin descripción').replace(/\n/g, ' ')} (Tel: ${cita.cliente_telefono || 'N/A'})`,
        'END:VEVENT'
      );
    }

    ics.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=citas_${artistaId}.ics`);
    res.send(ics.join('\r\n'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al generar iCal');
  }
});

module.exports = router;
