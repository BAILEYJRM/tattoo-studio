 const fs = require('fs');
const path = require('path');
const pool = require('./database');

const initDb = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Tablas creadas correctamente');
    process.exit(0);
  } catch (err) {
    console.error('Error creando tablas:', err);
    process.exit(1);
  }
};

initDb();