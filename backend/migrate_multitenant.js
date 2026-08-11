require('dotenv').config();
const pool = require('./src/config/database');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── 1. Create a default studio for the existing admin ─────────────────────
    console.log('📦 Creando estudio por defecto para el admin existente...');
    const existingAdmin = await client.query(
      "SELECT id, email FROM empleados WHERE email = 'admin@tattoostudio.com' LIMIT 1"
    );

    let demoEstudioId = null;
    if (existingAdmin.rows.length > 0) {
      const admin = existingAdmin.rows[0];
      // Check if a studio already exists for this admin
      const existingEstudio = await client.query(
        "SELECT id FROM estudios WHERE email_admin = $1 LIMIT 1", [admin.email]
      );
      if (existingEstudio.rows.length > 0) {
        demoEstudioId = existingEstudio.rows[0].id;
        console.log(`  ✓ Estudio existente encontrado: id=${demoEstudioId}`);
      } else {
        const estudioRes = await client.query(
          `INSERT INTO estudios (nombre, email_admin, plan, estado, trial_ends_at)
           VALUES ('Tattoo Studio Demo', $1, 'pro', 'activo', NOW() + INTERVAL '100 years')
           RETURNING id`,
          [admin.email]
        );
        demoEstudioId = estudioRes.rows[0].id;
        console.log(`  ✓ Estudio demo creado: id=${demoEstudioId}`);
      }
      // Assign estudio_id to existing admin
      await client.query(
        'UPDATE empleados SET estudio_id = $1 WHERE estudio_id IS NULL',
        [demoEstudioId]
      );
      console.log('  ✓ Admin existente asociado al estudio demo');
    }

    if (!demoEstudioId) {
      // No existing admin, create a generic studio to anchor orphaned data
      const estudioRes = await client.query(
        `INSERT INTO estudios (nombre, email_admin, plan, estado, trial_ends_at)
         VALUES ('Estudio Principal', 'admin@tattoostudio.com', 'pro', 'activo', NOW() + INTERVAL '100 years')
         RETURNING id`
      );
      demoEstudioId = estudioRes.rows[0].id;
    }

    // ── 2. Add estudio_id to all main tables ──────────────────────────────────
    const tables = [
      'clientes', 'citas', 'ventas', 'venta_lineas', 'gastos',
      'consentimientos', 'plantillas_consentimiento',
      'tintas', 'agujas', 'productos', 'movimientos_stock',
      'cabinas', 'articulos_tpv', 'eventos_calendario',
      'comunicaciones_enviadas', 'plantillas_comunicacion',
      'incidencias', 'limpiezas', 'ausencias_empleados',
      'configuracion_estudio', 'dias_festivos',
    ];

    console.log('\n📋 Añadiendo estudio_id a las tablas...');
    for (const table of tables) {
      try {
        await client.query(
          `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS estudio_id INTEGER REFERENCES estudios(id)`
        );
        console.log(`  ✓ ${table}`);
      } catch (err) {
        console.log(`  ⚠ ${table}: ${err.message}`);
      }
    }

    // ── 3. Assign all existing orphaned data to the demo studio ──────────────
    console.log('\n🔗 Asociando datos existentes al estudio demo...');
    for (const table of tables) {
      try {
        const res = await client.query(
          `UPDATE ${table} SET estudio_id = $1 WHERE estudio_id IS NULL`,
          [demoEstudioId]
        );
        if (res.rowCount > 0) console.log(`  ✓ ${table}: ${res.rowCount} filas actualizadas`);
      } catch (err) {
        console.log(`  ⚠ ${table}: ${err.message}`);
      }
    }

    // ── 4. Add indexes for performance ────────────────────────────────────────
    console.log('\n⚡ Creando índices...');
    for (const table of ['clientes', 'citas', 'ventas', 'gastos', 'empleados']) {
      try {
        await client.query(
          `CREATE INDEX IF NOT EXISTS idx_${table}_estudio_id ON ${table}(estudio_id)`
        );
        console.log(`  ✓ idx_${table}_estudio_id`);
      } catch (err) { console.log(`  ⚠ ${table}: ${err.message}`); }
    }

    await client.query('COMMIT');
    console.log('\n✅ Migración multi-tenant completada con éxito.');
    console.log(`   Estudio demo ID: ${demoEstudioId}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error, rollback ejecutado:', err.message);
    throw err;
  } finally {
    client.release();
    process.exit();
  }
}

migrate();
