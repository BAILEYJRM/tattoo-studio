const pool = require('../config/database');

const Proyecto = {
  async crear(data) {
    const {
      cliente_id,
      nombre,
      descripcion,
      zona_corporal,
      estilo,
      color,
      tamaño_aproximado,
      artista_id,
      sesiones_estimadas,
      duracion_estimada,
      precio_estimado,
      estado,
      referencias,
      notas_internas,
      origen_comercial
    } = data;
    const result = await pool.query(
      `INSERT INTO proyectos (
        cliente_id, nombre, descripcion, zona_corporal, estilo, color,
        tamaño_aproximado, artista_id, sesiones_estimadas, duracion_estimada,
        precio_estimado, estado, referencias, notas_internas, origen_comercial
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
      ) RETURNING *`,
      [
        cliente_id,
        nombre,
        descripcion,
        zona_corporal,
        estilo,
        color,
        tamaño_aproximado,
        artista_id,
        sesiones_estimadas,
        duracion_estimada,
        precio_estimado,
        estado || 'Nuevo',
        referencias,
        notas_internas,
        origen_comercial
      ]
    );
    return result.rows[0];
  },

  async buscarTodos() {
    const result = await pool.query('SELECT * FROM proyectos ORDER BY nombre');
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query('SELECT * FROM proyectos WHERE id=$1', [id]);
    return result.rows[0];
  },

  async actualizar(id, data) {
    const {
      cliente_id,
      nombre,
      descripcion,
      zona_corporal,
      estilo,
      color,
      tamaño_aproximado,
      artista_id,
      sesiones_estimadas,
      duracion_estimada,
      precio_estimado,
      estado,
      referencias,
      notas_internas,
      origen_comercial
    } = data;
    const result = await pool.query(
      `UPDATE proyectos SET
        cliente_id=$1, nombre=$2, descripcion=$3, zona_corporal=$4, estilo=$5,
        color=$6, tamaño_aproximado=$7, artista_id=$8, sesiones_estimadas=$9,
        duracion_estimada=$10, precio_estimado=$11, estado=$12, referencias=$13,
        notas_internas=$14, origen_comercial=$15
       WHERE id=$16 RETURNING *`,
      [
        cliente_id,
        nombre,
        descripcion,
        zona_corporal,
        estilo,
        color,
        tamaño_aproximado,
        artista_id,
        sesiones_estimadas,
        duracion_estimada,
        precio_estimado,
        estado,
        referencias,
        notas_internas,
        origen_comercial,
        id
      ]
    );
    return result.rows[0];
  }
};

module.exports = Proyecto;
