const pool = require('../config/database');

const Cliente = {
  async crear({
    nombre, apellidos, segundo_apellido, email, telefono, fecha_nacimiento, notas,
    dni, pais, provincia, localidad, direccion, codigo_postal,
    conflictivo, flexible, habla_ingles, es_cliente_estudio, cliente_pruebas,
    tutor_legal_nombre, tutor_legal_dni, tutor_legal_telefono,
    info_medica, acepta_comunicaciones, acepta_notificaciones_sistema, acepta_redes, como_nos_conocio,
    sexo, instagram, facebook, tiktok, twitter
  }) {
    const result = await pool.query(
      `INSERT INTO clientes
        (nombre, apellidos, segundo_apellido, email, telefono, fecha_nacimiento, notas,
         dni, pais, provincia, localidad, direccion, codigo_postal,
         conflictivo, flexible, habla_ingles, es_cliente_estudio, cliente_pruebas,
         tutor_legal_nombre, tutor_legal_dni, tutor_legal_telefono,
         info_medica, acepta_comunicaciones, acepta_notificaciones_sistema, acepta_redes, como_nos_conocio, 
         sexo, instagram, facebook, tiktok, twitter)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31)
       RETURNING *`,
      [nombre, apellidos, segundo_apellido, email, telefono, fecha_nacimiento, notas,
       dni, pais, provincia, localidad, direccion, codigo_postal,
       conflictivo ?? false, flexible ?? false, habla_ingles ?? false, es_cliente_estudio ?? false, cliente_pruebas ?? false,
       tutor_legal_nombre, tutor_legal_dni, tutor_legal_telefono,
       info_medica, acepta_comunicaciones ?? true, acepta_notificaciones_sistema ?? true, acepta_redes ?? false, como_nos_conocio,
       sexo, instagram, facebook, tiktok, twitter]
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
    nombre, apellidos, segundo_apellido, email, telefono, fecha_nacimiento, notas,
    dni, pais, provincia, localidad, direccion, codigo_postal,
    conflictivo, flexible, habla_ingles, es_cliente_estudio, cliente_pruebas,
    tutor_legal_nombre, tutor_legal_dni, tutor_legal_telefono,
    info_medica, acepta_comunicaciones, acepta_notificaciones_sistema, acepta_redes, como_nos_conocio,
    sexo, instagram, facebook, tiktok, twitter
  }) {
    const result = await pool.query(
      `UPDATE clientes SET
        nombre=$1, apellidos=$2, segundo_apellido=$3, email=$4, telefono=$5, fecha_nacimiento=$6, notas=$7,
        dni=$8, pais=$9, provincia=$10, localidad=$11, direccion=$12, codigo_postal=$13,
        conflictivo=$14, flexible=$15, habla_ingles=$16, es_cliente_estudio=$17, cliente_pruebas=$18,
        tutor_legal_nombre=$19, tutor_legal_dni=$20, tutor_legal_telefono=$21,
        info_medica=$22, acepta_comunicaciones=$23, acepta_notificaciones_sistema=$24, acepta_redes=$25, como_nos_conocio=$26,
        sexo=$27, instagram=$28, facebook=$29, tiktok=$30, twitter=$31
       WHERE id=$32 RETURNING *`,
      [nombre, apellidos, segundo_apellido, email, telefono, fecha_nacimiento, notas,
       dni, pais, provincia, localidad, direccion, codigo_postal,
       conflictivo, flexible, habla_ingles, es_cliente_estudio, cliente_pruebas,
       tutor_legal_nombre, tutor_legal_dni, tutor_legal_telefono,
       info_medica, acepta_comunicaciones, acepta_notificaciones_sistema, acepta_redes, como_nos_conocio,
       sexo, instagram, facebook, tiktok, twitter, id]
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
