const pool = require('./src/config/database');

async function run() {
  try {
    console.log('Creating tintas, agujas and associated tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tintas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        marca VARCHAR(100),
        color VARCHAR(100),
        codigo VARCHAR(100),
        numero_lote VARCHAR(100),
        fecha_caducidad DATE,
        homologada BOOLEAN DEFAULT true,
        producto_id INTEGER REFERENCES productos(id),
        activa BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agujas (
        id SERIAL PRIMARY KEY,
        marca VARCHAR(100),
        modelo VARCHAR(100),
        tipo VARCHAR(100),
        numero_lote VARCHAR(100),
        fecha_caducidad DATE,
        fecha_fabricacion DATE,
        producto_id INTEGER REFERENCES productos(id),
        activa BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS artista_tintas_defecto (
        empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
        tinta_id INTEGER REFERENCES tintas(id) ON DELETE CASCADE,
        PRIMARY KEY (empleado_id, tinta_id)
      );

      CREATE TABLE IF NOT EXISTS artista_agujas_defecto (
        empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
        aguja_id INTEGER REFERENCES agujas(id) ON DELETE CASCADE,
        PRIMARY KEY (empleado_id, aguja_id)
      );
    `);
    console.log('Migration successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

run();
