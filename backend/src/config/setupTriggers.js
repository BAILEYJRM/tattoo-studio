const pool = require('./database');

async function setupTriggers() {
  try {
    // 1. Crear función general de auditoría en PostgreSQL
    const triggerFunctionQuery = `
      CREATE OR REPLACE FUNCTION registrar_actividad_auto()
      RETURNS TRIGGER AS $$
      BEGIN
        IF (TG_OP = 'INSERT') THEN
          INSERT INTO actividad (entidad_tipo, entidad_id, accion, detalle)
          VALUES (TG_TABLE_NAME, NEW.id, 'creado_auto', row_to_json(NEW)::jsonb);
          RETURN NEW;
        ELSIF (TG_OP = 'UPDATE') THEN
          INSERT INTO actividad (entidad_tipo, entidad_id, accion, detalle)
          VALUES (TG_TABLE_NAME, NEW.id, 'actualizado_auto', jsonb_build_object('anterior', row_to_json(OLD)::jsonb, 'nuevo', row_to_json(NEW)::jsonb));
          RETURN NEW;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await pool.query(triggerFunctionQuery);

    // 2. Crear triggers para las tablas comerciales (Leads, Proyectos, Presupuestos)
    const tablas = ['leads', 'proyectos', 'presupuestos'];

    for (const tabla of tablas) {
      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auditoria_${tabla}'
          ) THEN
            CREATE TRIGGER trg_auditoria_${tabla}
            AFTER INSERT OR UPDATE ON ${tabla}
            FOR EACH ROW
            EXECUTE FUNCTION registrar_actividad_auto();
          END IF;
        END $$;
      `);
    }

    console.log('Triggers de auditoría configurados correctamente.');
  } catch (err) {
    console.error('Error al configurar triggers de auditoría:', err.message);
  }
}

module.exports = setupTriggers;
