const pool = require('../config/database');

const Consentimiento = {
  crear: async (datos) => {
    const { cliente_id, cita_id, plantilla_id, tipo, datos_cliente, firma_imagen, pdf_path, empleado_id } = datos;
    const result = await pool.query(
      `INSERT INTO consentimientos
         (cliente_id, cita_id, plantilla_id, tipo, datos_cliente, firma_imagen, pdf_path, firmado_en, empleado_id, estudio_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),$8,$9) RETURNING *`,
      [cliente_id || null, cita_id || null, plantilla_id, tipo,
        JSON.stringify(datos_cliente), firma_imagen, pdf_path, empleado_id, datos.estudio_id]
    );
    return result.rows[0];
  },

  buscarTodos: async (params = {}, estudio_id) => {
    let q = `SELECT c.*, e.nombre as empleado_nombre,
               cl.nombre || ' ' || cl.apellidos as cliente_nombre,
               p.nombre as plantilla_nombre
             FROM consentimientos c
             LEFT JOIN empleados e ON e.id = c.empleado_id
             LEFT JOIN clientes cl ON cl.id = c.cliente_id
             LEFT JOIN plantillas_consentimiento p ON p.id = c.plantilla_id`;
    const conditions = [`c.estudio_id = $1`];
    const values = [estudio_id];
    if (params.tipo) { values.push(params.tipo); conditions.push(`c.tipo = $${values.length}`); }
    if (params.cliente_id) { values.push(params.cliente_id); conditions.push(`c.cliente_id = $${values.length}`); }
    if (conditions.length) q += ' WHERE ' + conditions.join(' AND ');
    q += ' ORDER BY c.created_at DESC';
    const result = await pool.query(q, values);
    return result.rows;
  },

  buscarPorId: async (id, estudio_id) => {
    const result = await pool.query(
      `SELECT c.*, e.nombre as empleado_nombre,
         cl.nombre || ' ' || cl.apellidos as cliente_nombre,
         p.nombre as plantilla_nombre, p.contenido as plantilla_contenido
       FROM consentimientos c
       LEFT JOIN empleados e ON e.id = c.empleado_id
       LEFT JOIN clientes cl ON cl.id = c.cliente_id
       LEFT JOIN plantillas_consentimiento p ON p.id = c.plantilla_id
       WHERE c.id = $1 AND c.estudio_id = $2`,
      [id, estudio_id]
    );
    return result.rows[0];
  },

  actualizarPdf: async (id, pdf_path, estudio_id) => {
    await pool.query('UPDATE consentimientos SET pdf_path=$1 WHERE id=$2 AND estudio_id=$3', [pdf_path, id, estudio_id]);
  },

  buscarPorCliente: async (buscar, estudio_id) => {
    const result = await pool.query(
      `SELECT c.*, cl.nombre || ' ' || cl.apellidos as cliente_nombre, p.nombre as plantilla_nombre
       FROM consentimientos c
       LEFT JOIN clientes cl ON cl.id = c.cliente_id
       LEFT JOIN plantillas_consentimiento p ON p.id = c.plantilla_id
       WHERE (cl.nombre ILIKE $1 OR cl.apellidos ILIKE $1 OR (c.datos_cliente->>'nombre') ILIKE $1)
         AND c.estudio_id = $2
       ORDER BY c.created_at DESC`,
      [`%${buscar}%`, estudio_id]
    );
    return result.rows;
  },
};

module.exports = Consentimiento;
