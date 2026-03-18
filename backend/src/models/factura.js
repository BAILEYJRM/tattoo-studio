const pool = require('../config/database');

const Factura = {
  async crear({ recibo_id, cliente_id, datos_cliente, fecha, subtotal, iva_porcentaje, iva_importe, total }) {
    const seqRes = await pool.query("SELECT NEXTVAL('factura_seq') AS num");
    const num = seqRes.rows[0].num;
    const year = new Date(fecha).getFullYear();
    const numero = `FAC-${year}-${String(num).padStart(4, '0')}`;

    const result = await pool.query(
      `INSERT INTO facturas (numero, recibo_id, cliente_id, datos_cliente, fecha, subtotal, iva_porcentaje, iva_importe, total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [numero, recibo_id || null, cliente_id || null,
       datos_cliente ? JSON.stringify(datos_cliente) : null,
       fecha, subtotal, iva_porcentaje ?? 21, iva_importe, total]
    );
    return result.rows[0];
  },

  async buscarTodas({ fecha_inicio, fecha_fin, cliente_id } = {}) {
    const conditions = [];
    const values = [];
    if (fecha_inicio) { values.push(fecha_inicio); conditions.push(`f.fecha >= $${values.length}`); }
    if (fecha_fin) { values.push(fecha_fin); conditions.push(`f.fecha <= $${values.length}`); }
    if (cliente_id) { values.push(cliente_id); conditions.push(`f.cliente_id = $${values.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT f.*,
        cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
        r.numero AS recibo_numero
       FROM facturas f
       LEFT JOIN clientes cl ON f.cliente_id = cl.id
       LEFT JOIN recibos r ON f.recibo_id = r.id
       ${where}
       ORDER BY f.fecha DESC, f.created_at DESC`,
      values
    );
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query(
      `SELECT f.*,
        cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
        r.numero AS recibo_numero
       FROM facturas f
       LEFT JOIN clientes cl ON f.cliente_id = cl.id
       LEFT JOIN recibos r ON f.recibo_id = r.id
       WHERE f.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async actualizarPdf(id, pdf_path) {
    await pool.query('UPDATE facturas SET pdf_path=$1 WHERE id=$2', [pdf_path, id]);
  },
};

module.exports = Factura;
