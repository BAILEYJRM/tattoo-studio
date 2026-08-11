const pool = require('../config/database');

const Presupuesto = {
  async crear(data) {
    const {
      cliente_id,
      proyecto_id,
      artista_id,
      fecha,
      validez,
      servicios,
      sesiones_estimadas,
      precio_por_sesion,
      horas_estimadas,
      precio_fijo,
      descuento,
      impuesto,
      deposito_requerido,
      total_estimado,
      observaciones,
      condiciones,
      politica_cancelacion,
      estado
    } = data;
    const result = await pool.query(
      `INSERT INTO presupuestos (
        cliente_id, proyecto_id, artista_id, fecha, validez, servicios,
        sesiones_estimadas, precio_por_sesion, horas_estimadas, precio_fijo,
        descuento, impuesto, deposito_requerido, total_estimado,
        observaciones, condiciones, politica_cancelacion, estado
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
      ) RETURNING *`,
      [
        cliente_id,
        proyecto_id,
        artista_id,
        fecha,
        validez,
        servicios,
        sesiones_estimadas,
        precio_por_sesion,
        horas_estimadas,
        precio_fijo,
        descuento,
        impuesto,
        deposito_requerido,
        total_estimado,
        observaciones,
        condiciones,
        politica_cancelacion,
        estado || 'Borrador'
      ]
    );
    return result.rows[0];
  },

  async buscarTodos() {
    const result = await pool.query('SELECT * FROM presupuestos ORDER BY creado_en DESC');
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query('SELECT * FROM presupuestos WHERE id=$1', [id]);
    return result.rows[0];
  },

  async actualizar(id, data) {
    const {
      cliente_id,
      proyecto_id,
      artista_id,
      fecha,
      validez,
      servicios,
      sesiones_estimadas,
      precio_por_sesion,
      horas_estimadas,
      precio_fijo,
      descuento,
      impuesto,
      deposito_requerido,
      total_estimado,
      observaciones,
      condiciones,
      politica_cancelacion,
      estado
    } = data;
    const result = await pool.query(
      `UPDATE presupuestos SET
        cliente_id=$1, proyecto_id=$2, artista_id=$3, fecha=$4, validez=$5, servicios=$6,
        sesiones_estimadas=$7, precio_por_sesion=$8, horas_estimadas=$9, precio_fijo=$10,
        descuento=$11, impuesto=$12, deposito_requerido=$13, total_estimado=$14,
        observaciones=$15, condiciones=$16, politica_cancelacion=$17, estado=$18
       WHERE id=$19 RETURNING *`,
      [
        cliente_id,
        proyecto_id,
        artista_id,
        fecha,
        validez,
        servicios,
        sesiones_estimadas,
        precio_por_sesion,
        horas_estimadas,
        precio_fijo,
        descuento,
        impuesto,
        deposito_requerido,
        total_estimado,
        observaciones,
        condiciones,
        politica_cancelacion,
        estado,
        id
      ]
    );
    return result.rows[0];
  }
};

module.exports = Presupuesto;
