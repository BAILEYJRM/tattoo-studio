const Cita = require('../models/cita');
const pool = require('../config/database');

const getCitas = async (req, res) => {
  try {
    const { fecha, artista_id } = req.query;
    let citas;
    if (fecha) citas = await Cita.buscarPorFecha(fecha);
    else if (artista_id) citas = await Cita.buscarPorArtista(artista_id);
    else citas = await Cita.buscarTodas();
    res.json(citas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCita = async (req, res) => {
  try {
    const cita = await Cita.buscarPorId(req.params.id);
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(cita);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearCita = async (req, res) => {
  try {
    const cita = await Cita.crear(req.body);
    res.status(201).json(cita);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarCita = async (req, res) => {
  try {
    const cita = await Cita.actualizar(req.params.id, req.body);
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(cita);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const estados = ['pendiente', 'confirmada', 'completada', 'cancelada'];
    if (!estados.includes(estado)) return res.status(400).json({ error: 'Estado no válido' });
    const cita = await Cita.actualizarEstado(req.params.id, estado);
    res.json(cita);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const finalizarCita = async (req, res) => {
  try {
    const { forma_pago, precio_final, comision_artista, no_presentado } = req.body;
    const cita = await Cita.finalizar(req.params.id, { forma_pago, precio_final, comision_artista, no_presentado });
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
    if (no_presentado && cita.cliente_id) {
      await pool.query('UPDATE clientes SET no_shows = no_shows + 1 WHERE id=$1', [cita.cliente_id]);
    }
    res.json(cita);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const subirImagenCita = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
    const { tipo } = req.body;
    const imagen_path = `uploads/citas/${req.file.filename}`;
    const imagen = await Cita.crearImagen({ cita_id: req.params.id, tipo, imagen_path });
    res.status(201).json(imagen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getImagenesCita = async (req, res) => {
  try {
    const imagenes = await Cita.buscarImagenes(req.params.id);
    res.json(imagenes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verificarSolapamiento = async (req, res) => {
  try {
    const { artista_id, cabina_id, fecha, hora_inicio, hora_fin, excluir_id } = req.query;
    if (!fecha || !hora_inicio || !hora_fin) return res.json({ conflictos: [] });

    const hiStr = hora_inicio.length === 5 ? hora_inicio + ':00' : hora_inicio;
    const hfStr = hora_fin.length === 5 ? hora_fin + ':00' : hora_fin;

    const params = [fecha, hiStr, hfStr];
    let q = `
      SELECT c.*,
             cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
             e.nombre || ' ' || e.apellidos AS artista_nombre,
             cab.nombre AS cabina_nombre
      FROM citas c
      LEFT JOIN clientes cl ON cl.id = c.cliente_id
      LEFT JOIN empleados e ON e.id = c.artista_id
      LEFT JOIN cabinas cab ON cab.id = c.cabina_id
      WHERE c.fecha = $1
        AND c.estado NOT IN ('cancelada')
        AND c.hora_inicio < $3
        AND c.hora_fin > $2
    `;

    let idx = 4;
    if (excluir_id) { q += ` AND c.id != $${idx}`; params.push(excluir_id); idx++; }

    const orConds = [];
    if (artista_id) { orConds.push(`c.artista_id = $${idx}`); params.push(artista_id); idx++; }
    if (cabina_id) { orConds.push(`c.cabina_id = $${idx}`); params.push(cabina_id); idx++; }

    if (!orConds.length) return res.json({ conflictos: [] });
    q += ` AND (${orConds.join(' OR ')})`;

    const result = await pool.query(q, params);
    res.json({ conflictos: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearCitasGrupo = async (req, res) => {
  const { artista_id, cabina_id, fecha, hora_inicio, hora_fin, descripcion, clientes } = req.body;
  if (!clientes?.length) return res.status(400).json({ error: 'Se requiere al menos un cliente' });

  const hiStr = hora_inicio.length === 5 ? hora_inicio + ':00' : hora_inicio;
  const hfStr = hora_fin.length === 5 ? hora_fin + ':00' : hora_fin;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const creadas = [];
    for (const { cliente_id, precio } of clientes) {
      const qRes = await client.query(
        `INSERT INTO citas (cliente_id, artista_id, cabina_id, fecha, hora_inicio, hora_fin, descripcion, precio, estado)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pendiente') RETURNING *`,
        [cliente_id, artista_id || null, cabina_id || null, fecha, hiStr, hfStr,
          descripcion || null, precio ? Number(precio) : null]
      );
      creadas.push(qRes.rows[0]);
    }
    await client.query('COMMIT');
    res.status(201).json(creadas);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

module.exports = {
  getCitas, getCita, crearCita, actualizarCita, actualizarEstado,
  finalizarCita, subirImagenCita, getImagenesCita,
  verificarSolapamiento, crearCitasGrupo,
};
