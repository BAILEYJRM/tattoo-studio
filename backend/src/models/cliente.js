const pool = require('../config/database');

const Cliente = {
  async crear({
    nombre, apellidos, email, telefono, fecha_nacimiento, notas,
    conflictivo, flexible, habla_ingles, es_cliente_estudio,
    tutor_legal_nombre, tutor_legal_dni, tutor_legal_telefono,
    info_medica, acepta_comunicaciones, acepta_redes,
    sexo, instagram,
  }) {
    const result = await pool.query(
      `INSERT INTO clientes
        (nombre, apellidos, email, telefono, fecha_nacimiento, notas,
         conflictivo, flexible, habla_ingles, es_cliente_estudio,
         tutor_legal_nombre, tutor_legal_dni, tutor_legal_telefono,
         info_medica, acepta_comunicaciones, acepta_redes, sexo, instagram)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [nombre, apellidos, email, telefono, fecha_nacimiento, notas,
       conflictivo ?? false, flexible ?? false, habla_ingles ?? false, es_cliente_estudio ?? false,
       tutor_legal_nombre, tutor_legal_dni, tutor_legal_telefono,
       info_medica, acepta_comunicaciones ?? true, acepta_redes ?? false,
       sexo, instagram]
    );
    return result.rows[0];
  },

  async buscarTodos() {
    const result = await pool.query('SELECT * FROM clientes ORDER BY nombre');
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
    return result.rows[0];
  },

  async actualizar(id, {
    nombre, apellidos, email, telefono, fecha_nacimiento, notas,
    conflictivo, flexible, habla_ingles, es_cliente_estudio,
    tutor_legal_nombre, tutor_legal_dni, tutor_legal_telefono,
    info_medica, acepta_comunicaciones, acepta_redes,
    sexo, instagram,
  }) {
    const result = await pool.query(
      `UPDATE clientes SET
        nombre=$1, apellidos=$2, email=$3, telefono=$4, fecha_nacimiento=$5, notas=$6,
        conflictivo=$7, flexible=$8, habla_ingles=$9, es_cliente_estudio=$10,
        tutor_legal_nombre=$11, tutor_legal_dni=$12, tutor_legal_telefono=$13,
        info_medica=$14, acepta_comunicaciones=$15, acepta_redes=$16,
        sexo=$17, instagram=$18
       WHERE id=$19 RETURNING *`,
      [nombre, apellidos, email, telefono, fecha_nacimiento, notas,
       conflictivo, flexible, habla_ingles, es_cliente_estudio,
       tutor_legal_nombre, tutor_legal_dni, tutor_legal_telefono,
       info_medica, acepta_comunicaciones, acepta_redes,
       sexo, instagram, id]
    );
    return result.rows[0];
  },

  async incrementarNoShows(id) {
    const result = await pool.query(
      'UPDATE clientes SET no_shows = no_shows + 1 WHERE id=$1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  async buscarPorNombre(texto) {
    const result = await pool.query(
      `SELECT * FROM clientes WHERE nombre ILIKE $1 OR apellidos ILIKE $1 OR email ILIKE $1
       ORDER BY nombre`,
      [`%${texto}%`]
    );
    return result.rows;
  },

  async buscarConFiltros({ conflictivo, flexible } = {}) {
    const conditions = [];
    const values = [];
    if (conflictivo !== undefined) {
      conditions.push(`conflictivo = $${values.length + 1}`);
      values.push(conflictivo === 'true' || conflictivo === true);
    }
    if (flexible !== undefined) {
      conditions.push(`flexible = $${values.length + 1}`);
      values.push(flexible === 'true' || flexible === true);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT * FROM clientes ${where} ORDER BY nombre`,
      values
    );
    return result.rows;
  },
};

module.exports = Cliente;
