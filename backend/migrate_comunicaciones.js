const pool = require('./src/config/database');

const runMigration = async () => {
  try {
    console.log("Creando tablas de comunicaciones...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plantillas_comunicacion (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50) UNIQUE NOT NULL,
        asunto VARCHAR(200) NOT NULL,
        contenido TEXT NOT NULL,
        activa BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS comunicaciones_enviadas (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id),
        cita_id INTEGER REFERENCES citas(id),
        tipo VARCHAR(50) NOT NULL,
        estado VARCHAR(20) DEFAULT 'enviado',
        mensaje_error TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    const nuevasPlantillas = [
      {
        tipo: 'confirmacion_cita',
        asunto: 'Reserva confirmada en {{estudio}}',
        contenido: 'Hola {{cliente_nombre}},\n\nTu cita ha sido confirmada para el {{fecha}} a las {{hora_inicio}} con {{artista_nombre}}.',
        activa: true
      },
      {
        tipo: 'recordatorio_cita',
        asunto: 'Recordatorio de cita en {{estudio}}',
        contenido: 'Hola {{cliente_nombre}},\n\nTe recordamos que mañana tienes una cita con nosotros a las {{hora_inicio}}.',
        activa: true
      },
      {
        tipo: 'cuidados_tatuaje',
        asunto: 'Cuidados para tu nuevo tatuaje',
        contenido: 'Hola {{cliente_nombre}},\n\nGracias por tatuarte con nosotros. Recuerda seguir los consejos de cuidado que te dimos.',
        activa: true
      },
      {
        tipo: 'cuidados_piercing',
        asunto: 'Cuidados para tu nuevo piercing',
        contenido: 'Hola {{cliente_nombre}},\n\nRecuerda lavar tu piercing dos veces al día.',
        activa: true
      },
      {
        tipo: 'cumpleanos',
        asunto: '¡Feliz Cumpleaños de parte de {{estudio}}!',
        contenido: 'Hola {{cliente_nombre}},\n\n¡Queremos desearte un muy feliz cumpleaños!',
        activa: true
      },
      {
        tipo: 'interes_curacion_tatuaje',
        asunto: '¿Qué tal va curando tu tatuaje?',
        contenido: 'Hola {{cliente_nombre}},\n\nHan pasado unos días desde tu cita en {{estudio}}. Queríamos preguntarte qué tal va el proceso de curación de tu tatuaje.\n\nRecuerda que si tienes cualquier duda, estamos aquí para ayudarte.',
        activa: true
      },
      {
        tipo: 'interes_curacion_piercing',
        asunto: '¿Qué tal va curando tu piercing?',
        contenido: 'Hola {{cliente_nombre}},\n\nHan pasado unos días desde tu cita en {{estudio}}. Queríamos preguntarte qué tal va el proceso de curación de tu piercing.\n\nRecuerda mantener una buena higiene y contactarnos si notas algo inusual.',
        activa: true
      },
      {
        tipo: 'recordatorio_whatsapp',
        asunto: 'WhatsApp (Sin asunto)',
        contenido: 'Hola {{cliente_nombre}}, te recordamos que tienes una cita en {{estudio}} el {{fecha}} a las {{hora_inicio}} con {{artista_nombre}}.',
        activa: true
      }
    ];

    for (const p of nuevasPlantillas) {
      await pool.query(`
        INSERT INTO plantillas_comunicacion (tipo, asunto, contenido, activa)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (tipo) DO NOTHING
      `, [p.tipo, p.asunto, p.contenido, p.activa]);
      console.log(`Inserted or skipped: ${p.tipo}`);
    }
    console.log('Migration done.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

runMigration();
