const pool = require('./src/config/database');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create estudios table
    await client.query(`
      CREATE TABLE IF NOT EXISTS estudios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email_admin VARCHAR(255) NOT NULL UNIQUE,
        plan VARCHAR(50) NOT NULL DEFAULT 'basico',
        estado VARCHAR(50) NOT NULL DEFAULT 'trial',
        trial_ends_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Add estudio_id to empleados if it doesn't exist
    await client.query(`
      ALTER TABLE empleados 
      ADD COLUMN IF NOT EXISTS estudio_id INTEGER REFERENCES estudios(id);
    `);

    await client.query('COMMIT');
    console.log('✅ Migración multi-tenant completada.');
    console.log('   - Tabla estudios creada.');
    console.log('   - Columna estudio_id añadida a empleados.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    process.exit();
  }
}

migrate();
