const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const Empleado = {
  async crear({ nombre, apellidos, email, password, telefono, rol }) {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO empleados (nombre, apellidos, email, password, telefono, rol)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, apellidos, email, rol`,
      [nombre, apellidos, email, hash, telefono, rol]
    );
    return result.rows[0];
  },

  async buscarPorEmail(email) {
    const result = await pool.query(
      'SELECT * FROM empleados WHERE email = $1 AND activo = true',
      [email]
    );
    return result.rows[0];
  },

  async buscarTodos() {
    const result = await pool.query(
      'SELECT id, nombre, apellidos, email, telefono, rol, activo, created_at FROM empleados ORDER BY nombre'
    );
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query(
      'SELECT id, nombre, apellidos, email, telefono, rol, activo FROM empleados WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
};

module.exports = Empleado;