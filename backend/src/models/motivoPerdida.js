const pool = require('../config/database');

const MotivoPerdida = {
  async obtenerTodos() {
    const result = await pool.query('SELECT * FROM motivos_perdida ORDER BY descripcion ASC');
    return result.rows;
  },

  async crear(descripcion) {
    const result = await pool.query(
      'INSERT INTO motivos_perdida (descripcion) VALUES ($1) RETURNING *',
      [descripcion]
    );
    return result.rows[0];
  },

  async sembrarPorDefecto() {
    const result = await pool.query('SELECT COUNT(*) FROM motivos_perdida');
    if (parseInt(result.rows[0].count, 10) === 0) {
      const motivos = [
        'Precio elevado',
        'Sin respuesta / Abandono',
        'Eligió otro estudio',
        'Sin disponibilidad de fechas',
        'Cambio de idea del cliente',
        'Motivos personales'
      ];
      for (const m of motivos) {
        await pool.query('INSERT INTO motivos_perdida (descripcion) VALUES ($1)', [m]);
      }
    }
  }
};

module.exports = MotivoPerdida;
