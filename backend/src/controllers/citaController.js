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
    // Incrementar no_shows si aplica
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

module.exports = { getCitas, getCita, crearCita, actualizarCita, actualizarEstado, finalizarCita, subirImagenCita, getImagenesCita };
