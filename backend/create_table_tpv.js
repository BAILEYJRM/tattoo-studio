const pool = require('./src/config/database');
async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS articulos_tpv (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        producto_id INTEGER REFERENCES productos(id),
        categoria VARCHAR(50),
        precio_base DECIMAL(10,2) NOT NULL,
        color VARCHAR(50),
        icono VARCHAR(50),
        opciones JSONB,
        activo BOOLEAN DEFAULT true
      )
    `);
    console.log('Tabla articulos_tpv creada');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
init();
