const pg = require('pg');
const { Pool } = pg;
const dotenv = require('dotenv');

// Configurar pg para que no convierta los campos DATE (OID 1082) a objetos Date locales, evitando desfases de zona horaria.
pg.types.setTypeParser(1082, function(stringValue) {
  return stringValue;
});

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('connect', () => {
  console.log('Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Error en PostgreSQL:', err);
});

module.exports = pool;