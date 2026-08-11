const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const Estudio = {
  async crear({ nombre, email }) {
    const result = await pool.query(
      `INSERT INTO estudios (nombre, email_admin) VALUES ($1, $2)
       RETURNING id, nombre, email_admin, plan, estado, trial_ends_at`,
      [nombre, email]
    );
    return result.rows[0];
  },

  async buscarPorId(id) {
    const result = await pool.query('SELECT * FROM estudios WHERE id = $1', [id]);
    return result.rows[0];
  }
};


const Empleado = {
  async crear({ nombre, apellidos, email, password, telefono, rol, estudio_id }) {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO empleados (nombre, apellidos, email, password, telefono, rol, estudio_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nombre, apellidos, email, rol`,
      [nombre, apellidos, email, hash, telefono, rol, estudio_id]
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

  async buscarTodos(estudio_id) {
    let query = `SELECT id, nombre, apellidos, email, telefono, rol, activo, created_at
                 FROM empleados
                 WHERE rol != 'superadmin' AND email != 'baileyjrm@gmail.com'`;
    let params = [];

    if (estudio_id) {
      query += ` AND estudio_id = $1`;
      params.push(estudio_id);
    }

    query += ` ORDER BY nombre`;
    const result = await pool.query(query, params);
    return result.rows;
  },

  async buscarPorId(id, estudio_id) {
    const result = await pool.query(
      'SELECT id, nombre, apellidos, email, telefono, rol, activo FROM empleados WHERE id = $1 AND estudio_id = $2',
      [id, estudio_id]
    );
    return result.rows[0];
  },

  async guardarTokenRecuperacion(email, token, expires) {
    await pool.query(
      'UPDATE empleados SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
      [token, expires, email]
    );
  },

  async buscarPorTokenRecuperacion(token) {
    const result = await pool.query(
      'SELECT * FROM empleados WHERE reset_password_token = $1 AND reset_password_expires > NOW() AND activo = true',
      [token]
    );
    return result.rows[0];
  },

  async actualizarPassword(id, newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE empleados SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [hash, id]
    );
  }
};

module.exports = { Empleado, Estudio };