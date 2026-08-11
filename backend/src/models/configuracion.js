const pool = require('../config/database');

const CLAVES_PUBLICAS = [
  'estudio_nombre', 'estudio_email', 'estudio_telefono', 'estudio_instagram', 'estudio_facebook',
  'estudio_direccion', 'estudio_cp', 'estudio_localidad', 'estudio_provincia',
  'horario_lunes', 'horario_martes', 'horario_miercoles', 'horario_jueves',
  'horario_viernes', 'horario_sabado', 'horario_domingo',
  'servicios_tatuaje', 'servicios_piercing', 'servicios_microblading',
  'servicios_laser', 'servicios_barberia', 'servicios_estetica',
  'politica_cancelacion', 'info_adicional_clientes',
  'theme_primary_color', 'theme_bg_color', 'theme_font_family', 'theme_font_size', 'theme_logo_url',
  'factura_nombre', 'factura_direccion', 'factura_contactos', 'factura_cif', 'factura_logo_url', 'factura_texto_legal', 'factura_anio_fiscal'
];

async function getAll(estudio_id) {
  const res = await pool.query('SELECT clave, valor FROM configuracion_estudio WHERE estudio_id = $1 ORDER BY clave', [estudio_id]);
  const obj = {};
  res.rows.forEach(r => { obj[r.clave] = r.valor; });
  return obj;
}

async function get(clave, estudio_id) {
  const res = await pool.query('SELECT valor FROM configuracion_estudio WHERE clave = $1 AND estudio_id = $2', [clave, estudio_id]);
  return res.rows[0]?.valor ?? null;
}

async function set(clave, valor, estudio_id) {
  await pool.query(
    `INSERT INTO configuracion_estudio (clave, valor, updated_at, estudio_id)
     VALUES ($1, $2, NOW(), $3)
     ON CONFLICT (clave, estudio_id) DO UPDATE SET valor = $2, updated_at = NOW()`,
    [clave, String(valor), estudio_id]
  );
}

async function setMultiple(objeto, estudio_id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [clave, valor] of Object.entries(objeto)) {
      await client.query(
        `INSERT INTO configuracion_estudio (clave, valor, updated_at, estudio_id)
         VALUES ($1, $2, NOW(), $3)
         ON CONFLICT (clave, estudio_id) DO UPDATE SET valor = $2, updated_at = NOW()`,
        [clave, String(valor), estudio_id]
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

async function getPublica(estudio_id) {
  const res = await pool.query(
    'SELECT clave, valor FROM configuracion_estudio WHERE clave = ANY($1) AND estudio_id = $2',
    [CLAVES_PUBLICAS, estudio_id]
  );
  const obj = {};
  res.rows.forEach(r => { obj[r.clave] = r.valor; });
  return obj;
}

module.exports = { getAll, get, set, setMultiple, getPublica };
