const pool = require('./src/config/database');

async function run() {
  try {
    console.log('Adding new columns to ventas and venta_lineas tables...');
    await pool.query(`
      ALTER TABLE ventas
      ADD COLUMN IF NOT EXISTS impuestos NUMERIC(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS descuentos NUMERIC(10, 2) DEFAULT 0;

      ALTER TABLE venta_lineas
      ADD COLUMN IF NOT EXISTS impuesto_porcentaje NUMERIC(5, 2) DEFAULT 21.00,
      ADD COLUMN IF NOT EXISTS descuento_porcentaje NUMERIC(5, 2) DEFAULT 0.00;
    `);
    console.log('Migration successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

run();
