const pool = require('../config/database');

const Lead = {
  async crear(data) {
    const {
      nombre,
      telefono,
      email,
      instagram,
      origen,
      artista_solicitado,
      estilo_solicitado,
      descripcion,
      notas_internas,
      responsable_id,
      proyecto_id,
      cliente_id
    } = data;
    const result = await pool.query(
      `INSERT INTO leads (
        nombre, telefono, email, instagram, origen, artista_solicitado,
        estilo_solicitado, descripcion, notas_internas, responsable_id,
        estado, proyecto_id, cliente_id
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      ) RETURNING *`,
      [
        nombre,
        telefono,
        email,
        instagram,
        origen,
        artista_solicitado,
        estilo_solicitado,
        descripcion,
        notas_internas,
        responsable_id,
        'Nuevo',
        proyecto_id,
        cliente_id
      ]
    );
    return result.rows[0];
  },

  async buscarTodos() {
    const result = await pool.query('SELECT * FROM leads ORDER BY nombre');
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query('SELECT * FROM leads WHERE id=$1', [id]);
    return result.rows[0];
  },

  async actualizar(id, data) {
    const { nombre, telefono, email, instagram, origen, artista_solicitado, estilo_solicitado, descripcion, notas_internas, responsable_id, estado, proyecto_id, cliente_id } = data;
    const result = await pool.query(
      `UPDATE leads SET
        nombre=$1, telefono=$2, email=$3, instagram=$4, origen=$5,
        artista_solicitado=$6, estilo_solicitado=$7, descripcion=$8,
        notas_internas=$9, responsable_id=$10, estado=$11,
        proyecto_id=$12, cliente_id=$13
       WHERE id=$14 RETURNING *`,
      [nombre, telefono, email, instagram, origen, artista_solicitado, estilo_solicitado, descripcion, notas_internas, responsable_id, estado, proyecto_id, cliente_id, id]
    );
    return result.rows[0];
  }
};

module.exports = Lead;
