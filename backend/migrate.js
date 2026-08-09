const pool = require('./src/config/database');

async function run() {
  try {
    console.log('Adding new columns to clientes table...');
    await pool.query(`
      ALTER TABLE clientes
      ADD COLUMN IF NOT EXISTS segundo_apellido VARCHAR(100),
      ADD COLUMN IF NOT EXISTS pais VARCHAR(100),
      ADD COLUMN IF NOT EXISTS provincia VARCHAR(100),
      ADD COLUMN IF NOT EXISTS localidad VARCHAR(100),
      ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(20),
      ADD COLUMN IF NOT EXISTS acepta_notificaciones_sistema BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS cliente_pruebas BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS como_nos_conocio VARCHAR(100),
      ADD COLUMN IF NOT EXISTS facebook VARCHAR(100),
      ADD COLUMN IF NOT EXISTS tiktok VARCHAR(100),
      ADD COLUMN IF NOT EXISTS twitter VARCHAR(100);
    `);
    console.log('Migration successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

run();
