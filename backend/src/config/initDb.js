const fs = require('fs');
const path = require('path');
const pool = require('./database');

const CABINAS_SEED = [
  { nombre: 'Cabina 1 — Tatuaje', descripcion: 'Cabina principal para sesiones de tatuaje. Mesa regulable, lámpara de alta intensidad.' },
  { nombre: 'Cabina 2 — Tatuaje', descripcion: 'Segunda cabina de tatuaje. Sillón reclinable, equipo de ventilación independiente.' },
  { nombre: 'Cabina 3 — Tatuaje', descripcion: 'Cabina para trabajos de detalle. Luz cenital y lupa de aumento.' },
  { nombre: 'Cabina 4 — Piercing', descripcion: 'Cabina exclusiva para piercings. Camilla de exploración y autoclave propio.' },
  { nombre: 'Cabina 5 — Microblading', descripcion: 'Cabina de micropigmentación. Luz fría, espejo iluminado y sillón ergonómico.' },
  { nombre: 'Cabina 6 — Láser', descripcion: 'Cabina de eliminación láser. Equipo Q-Switched Nd:YAG, gafas protectoras y extractor de humos.' },
];

const initDb = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Tablas creadas correctamente');

    // Seed cabinas si no existen
    const { rows } = await pool.query('SELECT COUNT(*) FROM cabinas');
    if (parseInt(rows[0].count) === 0) {
      for (const c of CABINAS_SEED) {
        await pool.query(
          'INSERT INTO cabinas (nombre, descripcion) VALUES ($1, $2)',
          [c.nombre, c.descripcion]
        );
      }
      console.log(`Cabinas de ejemplo insertadas (${CABINAS_SEED.length})`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error creando tablas:', err);
    process.exit(1);
  }
};

initDb();
