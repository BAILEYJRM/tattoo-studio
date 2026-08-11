require('dotenv').config();
const pool = require('./src/config/database');

async function createTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS recibos (
        id SERIAL PRIMARY KEY,
        numero VARCHAR(50) UNIQUE NOT NULL,
        cita_id INTEGER REFERENCES citas(id),
        venta_id INTEGER REFERENCES ventas(id),
        cliente_id INTEGER REFERENCES clientes(id),
        artista_id INTEGER REFERENCES empleados(id),
        fecha DATE NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        iva_porcentaje DECIMAL(5,2) DEFAULT 0,
        iva_importe DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        forma_pago VARCHAR(50),
        concepto TEXT,
        pdf_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        estudio_id INTEGER REFERENCES estudios(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS facturas (
        id SERIAL PRIMARY KEY,
        numero VARCHAR(50) UNIQUE NOT NULL,
        recibo_id INTEGER REFERENCES recibos(id),
        cliente_id INTEGER REFERENCES clientes(id),
        datos_cliente JSONB,
        fecha DATE NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        iva_porcentaje DECIMAL(5,2) DEFAULT 21,
        iva_importe DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        pdf_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        estudio_id INTEGER REFERENCES estudios(id)
      )
    `);

    await client.query("CREATE SEQUENCE IF NOT EXISTS recibo_seq START 1");
    await client.query("CREATE SEQUENCE IF NOT EXISTS factura_seq START 1");

    await client.query('COMMIT');
    console.log('Tablas facturas y recibos creadas con estudio_id');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
  } finally {
    client.release();
    process.exit();
  }
}

createTables();
