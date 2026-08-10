const pool = require('./src/config/database');

async function migratePwdReset() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Add columns to empleados table if they do not exist
    await client.query(`
      ALTER TABLE empleados 
      ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;
    `);

    await client.query('COMMIT');
    console.log('✅ Migración de password reset completada con éxito.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante la migración:', err);
  } finally {
    client.release();
    process.exit();
  }
}

migratePwdReset();
