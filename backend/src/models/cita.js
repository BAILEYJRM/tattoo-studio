 const pool = require('../config/database');

const Cita = {
  async crear({ cliente_id, artista_id, fecha, hora_inicio, hora_fin, descripcion, precio }) {
    const result = await pool.query(
      `INSERT INTO citas (cliente_id, artista_id, fecha, hora_inicio, hora_fin, descripcion, precio)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [cliente_id, artista_id, fecha, hora_inicio, hora_fin, descripcion, precio]
    );
    return result.rows[0];
  },

  async buscarTodas() {
    const result = await pool.query(
      `SELECT c.*, 
        cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
        cl.telefono AS cliente_telefono,
        e.nombre || ' ' || e.apellidos AS artista_nombre
       FROM citas c
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
       LEFT JOIN empleados e ON c.artista_id = e.id
       ORDER BY c.fecha, c.hora_inicio`
    );
    return result.rows;
  },

  async buscarPorFecha(fecha) {
    const result = await pool.query(
      `SELECT c.*, 
        cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
        cl.telefono AS cliente_telefono,
        e.nombre || ' ' || e.apellidos AS artista_nombre
       FROM citas c
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
       LEFT JOIN empleados e ON c.artista_id = e.id
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
        cl.telefono AS cliente_telefono
       FROM citas c
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
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
        e.nombre || ' ' || e.apellidos AS artista_nombre
       FROM citas c
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
       LEFT JOIN empleados e ON c.artista_id = e.id
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

  async actualizar(id, { cliente_id, artista_id, fecha, hora_inicio, hora_fin, descripcion, precio, estado }) {
    const result = await pool.query(
      `UPDATE citas SET cliente_id=$1, artista_id=$2, fecha=$3, hora_inicio=$4,
       hora_fin=$5, descripcion=$6, precio=$7, estado=$8 WHERE id=$9 RETURNING *`,
      [cliente_id, artista_id, fecha, hora_inicio, hora_fin, descripcion, precio, estado, id]
    );
    return result.rows[0];
  }
};

module.exports = Cita;