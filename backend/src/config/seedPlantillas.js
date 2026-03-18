const pool = require('./database');
const PLANTILLAS = require('../data/plantillas');

async function seedPlantillas() {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM plantillas_consentimiento');
    if (parseInt(rows[0].count) > 0) return; // Ya existen plantillas

    for (const p of PLANTILLAS) {
      await pool.query(
        'INSERT INTO plantillas_consentimiento (tipo, nombre, contenido) VALUES ($1, $2, $3)',
        [p.tipo, p.nombre, p.contenido]
      );
    }
    console.log(`Plantillas de consentimiento insertadas (${PLANTILLAS.length})`);
  } catch (err) {
    console.error('Error en seedPlantillas:', err.message);
  }
}

module.exports = seedPlantillas;
