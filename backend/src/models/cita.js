const pool = require('../config/database');

const Cita = {
  async crear({
    cliente_id, artista_id, cabina_id, fecha, hora_inicio, hora_fin, descripcion, precio,
    importe_senal, senal_cobrada, forma_pago, no_presentado, comision_artista, notas_internas,
  }) {
    const result = await pool.query(
      `INSERT INTO citas
        (cliente_id, artista_id, cabina_id, fecha, hora_inicio, hora_fin, descripcion, precio,
         importe_senal, senal_cobrada, forma_pago, no_presentado, comision_artista, notas_internas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [cliente_id, artista_id, cabina_id, fecha, hora_inicio, hora_fin, descripcion, precio,
       importe_senal ?? 0, senal_cobrada ?? false, forma_pago, no_presentado ?? false,
       comision_artista, notas_internas]
    );
    return result.rows[0];
  },

  async buscarTodas() {
    const result = await pool.query(
      `SELECT c.*,
        cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
        cl.telefono AS cliente_telefono,
        cl.conflictivo AS cliente_conflictivo,
        cl.no_shows AS cliente_no_shows,
        e.nombre || ' ' || e.apellidos AS artista_nombre,
        e.color_calendario AS artista_color,
        cab.nombre AS cabina_nombre
       FROM citas c
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
       LEFT JOIN empleados e ON c.artista_id = e.id
       LEFT JOIN cabinas cab ON c.cabina_id = cab.id
       ORDER BY c.fecha, c.hora_inicio`
    );
    return result.rows;
  },

  async buscarPorFecha(fecha) {
    const result = await pool.query(
      `SELECT c.*,
        cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
        cl.telefono AS cliente_telefono,
        cl.conflictivo AS cliente_conflictivo,
        cl.no_shows AS cliente_no_shows,
        e.nombre || ' ' || e.apellidos AS artista_nombre,
        e.color_calendario AS artista_color,
        cab.nombre AS cabina_nombre
       FROM citas c
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
       LEFT JOIN empleados e ON c.artista_id = e.id
       LEFT JOIN cabinas cab ON c.cabina_id = cab.id
       WHERE c.fecha = $1
       ORDER BY c.hora_inicio`,
      [fecha]
    );
    return result.rows;
  },

  async buscarPorArtista(artista_id) {
    const result = await pool.query(
      `SELECT c.*,
        cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
        cl.telefono AS cliente_telefono,
        cl.conflictivo AS cliente_conflictivo,
        cl.no_shows AS cliente_no_shows,
        e.color_calendario AS artista_color,
        cab.nombre AS cabina_nombre
       FROM citas c
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
       LEFT JOIN empleados e ON c.artista_id = e.id
       LEFT JOIN cabinas cab ON c.cabina_id = cab.id
       WHERE c.artista_id = $1
       ORDER BY c.fecha, c.hora_inicio`,
      [artista_id]
    );
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query(
      `SELECT c.*,
        cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
        cl.telefono AS cliente_telefono,
        cl.conflictivo AS cliente_conflictivo,
        cl.no_shows AS cliente_no_shows,
        e.nombre || ' ' || e.apellidos AS artista_nombre,
        e.color_calendario AS artista_color,
        cab.nombre AS cabina_nombre
       FROM citas c
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
       LEFT JOIN empleados e ON c.artista_id = e.id
       LEFT JOIN cabinas cab ON c.cabina_id = cab.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async actualizarEstado(id, estado) {
    const result = await pool.query(
      'UPDATE citas SET estado=$1 WHERE id=$2 RETURNING *',
      [estado, id]
    );
    return result.rows[0];
  },

  async actualizar(id, {
    cliente_id, artista_id, cabina_id, fecha, hora_inicio, hora_fin, descripcion, precio, estado,
    importe_senal, senal_cobrada, forma_pago, no_presentado, comision_artista, notas_internas,
  }) {
    const result = await pool.query(
      `UPDATE citas SET
        cliente_id=$1, artista_id=$2, cabina_id=$3, fecha=$4, hora_inicio=$5, hora_fin=$6,
        descripcion=$7, precio=$8, estado=$9, importe_senal=$10, senal_cobrada=$11,
        forma_pago=$12, no_presentado=$13, comision_artista=$14, notas_internas=$15
       WHERE id=$16 RETURNING *`,
      [cliente_id, artista_id, cabina_id, fecha, hora_inicio, hora_fin, descripcion, precio, estado,
       importe_senal, senal_cobrada, forma_pago, no_presentado, comision_artista, notas_internas, id]
    );
    return result.rows[0];
  },

  async finalizar(id, { forma_pago, precio_final, comision_artista, no_presentado }) {
    const result = await pool.query(
      `UPDATE citas SET
        estado='completada', forma_pago=$1, precio=$2, comision_artista=$3, no_presentado=$4
       WHERE id=$5 RETURNING *`,
      [forma_pago, precio_final, comision_artista, no_presentado ?? false, id]
    );
    return result.rows[0];
  },

  // Imágenes
  async crearImagen({ cita_id, tipo, imagen_path }) {
    const result = await pool.query(
      `INSERT INTO cita_imagenes (cita_id, tipo, imagen_path) VALUES ($1,$2,$3) RETURNING *`,
      [cita_id, tipo || 'referencia', imagen_path]
    );
    return result.rows[0];
  },

  async buscarImagenes(cita_id) {
    const result = await pool.query(
      'SELECT * FROM cita_imagenes WHERE cita_id=$1 ORDER BY created_at',
      [cita_id]
    );
    return result.rows;
  },
};

module.exports = Cita;
