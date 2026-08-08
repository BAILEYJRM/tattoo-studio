const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const query = `
      INSERT INTO empleados (nombre, apellidos, email, password, rol, activo, nombre_artistico)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email
    `;
    const values = ['Admin', 'Estudio', 'admin@tattoostudio.com', hashedPassword, 'admin', true, 'Admin'];
    const res = await pool.query(query, values);
    console.log('Usuario admin creado con éxito:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    if (err.code === '23505') {
      console.log('El usuario admin ya existe (email duplicado).');
      process.exit(0);
    } else {
      console.error('Error al crear admin:', err);
      process.exit(1);
    }
  }
}

createAdmin();
