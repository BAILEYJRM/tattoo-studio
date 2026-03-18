const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const pool = require('./config/database');

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Servir archivos estáticos (PDFs, fotos de incidencias, imágenes de citas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Prueba de conexión a base de datos
app.get('/api/db-health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/empleados', require('./routes/empleados'));
app.use('/api/citas', require('./routes/citas'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/movimientos-stock', require('./routes/movimientosStock'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/gastos', require('./routes/gastos'));
app.use('/api/plantillas-consentimiento', require('./routes/plantillasConsentimiento'));
app.use('/api/consentimientos', require('./routes/consentimientos'));
app.use('/api/cabinas', require('./routes/cabinas'));
app.use('/api/limpiezas', require('./routes/limpiezas'));
app.use('/api/incidencias', require('./routes/incidencias'));
app.use('/api/ausencias', require('./routes/ausencias'));
app.use('/api/eventos-calendario', require('./routes/eventosCalendario'));

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  const seedPlantillas = require('./config/seedPlantillas');
  await seedPlantillas();
});

module.exports = app;