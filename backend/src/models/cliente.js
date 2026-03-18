 const pool = require('../config/database');

const Cliente = {
  async crear({ nombre, apellidos, email, telefono, fecha_nacimiento, notas }) {
    const result = await pool.query(
      `INSERT INTO clientes (nombre, apellidos, email, telefono, fecha_nacimiento, notas)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nombre, apellidos, email, telefono, fecha_nacimiento, notas]
    );
    return result.rows[0];
  },

  async buscarTodos() {
    const result = await pool.query(
      'SELECT * FROM clientes ORDER BY nombre'
    );
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query(
      'SELECT * FROM clientes WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async actualizar(id, { nombre, apellidos, email, telefono, fecha_nacimiento, notas }) {
    const result = await pool.query(
      `UPDATE clientes SET nombre=$1, apellidos=$2, email=$3, telefono=$4,
       fecha_nacimiento=$5, notas=$6 WHERE id=$7 RETURNING *`,
      [nombre, apellidos, email, telefono, fecha_nacimiento, notas, id]
    );
    return result.rows[0];
  },

  async buscarPorNombre(texto) {
    const result = await pool.query(
      `SELECT * FROM clientes WHERE nombre ILIKE $1 OR apellidos ILIKE $1 OR email ILIKE $1 ORDER BY nombre`,
      [`%${texto}%`]
    );
    return result.rows;
  }
};

module.exports = Cliente;