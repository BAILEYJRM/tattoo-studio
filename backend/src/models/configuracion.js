const pool = require('../config/database');

const CLAVES_PUBLICAS = [
  'estudio_nombre', 'estudio_email', 'estudio_telefono', 'estudio_instagram', 'estudio_facebook',
  'estudio_direccion', 'estudio_cp', 'estudio_localidad', 'estudio_provincia',
  'horario_lunes', 'horario_martes', 'horario_miercoles', 'horario_jueves',
  'horario_viernes', 'horario_sabado', 'horario_domingo',
  'servicios_tatuaje', 'servicios_piercing', 'servicios_microblading',
  'servicios_laser', 'servicios_barberia', 'servicios_estetica',
  'politica_cancelacion', 'info_adicional_clientes',
];

async function getAll() {
  const res = await pool.query('SELECT clave, valor FROM configuracion_estudio ORDER BY clave');
  const obj = {};
  res.rows.forEach(r => { obj[r.clave] = r.valor; });
  return obj;
}

async function get(clave) {
  const res = await pool.query('SELECT valor FROM configuracion_estudio WHERE clave = $1', [clave]);
  return res.rows[0]?.valor ?? null;
}

async function set(clave, valor) {
  await pool.query(
    `INSERT INTO configuracion_estudio (clave, valor, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (clave) DO UPDATE SET valor = $2, updated_at = NOW()`,
    [clave, String(valor)]
  );
}

async function setMultiple(objeto) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [clave, valor] of Object.entries(objeto)) {
      await client.query(
        `INSERT INTO configuracion_estudio (clave, valor, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (clave) DO UPDATE SET valor = $2, updated_at = NOW()`,
        [clave, String(valor)]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getPublica() {
  const res = await pool.query(
    'SELECT clave, valor FROM configuracion_estudio WHERE clave = ANY($1)',
    [CLAVES_PUBLICAS]
  );
  const obj = {};
  res.rows.forEach(r => { obj[r.clave] = r.valor; });
  return obj;
}

module.exports = { getAll, get, set, setMultiple, getPublica };
