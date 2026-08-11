require('dotenv').config();
const pool = require('./src/config/database');

async function createTable() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS alertas (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL,
        gravedad VARCHAR(20) DEFAULT 'media',
        titulo VARCHAR(200) NOT NULL,
        mensaje TEXT,
        entidad_tipo VARCHAR(50),
        entidad_id INTEGER,
        estado VARCHAR(20) DEFAULT 'pendiente',
        resuelta_por INTEGER REFERENCES empleados(id),
        resuelta_en TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query('COMMIT');
    console.log('Tabla alertas creada correctamente');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
  } finally {
    client.release();
    process.exit();
  }
}

createTable();
