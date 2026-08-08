const pool = require('../config/database');
const { generarReciboPdf } = require('../utils/generarReciboPdf');

const Recibo = {
  async crear({ cita_id, venta_id, cliente_id, artista_id, fecha, subtotal, iva_porcentaje, iva_importe, total, forma_pago, concepto }) {
    const seqRes = await pool.query("SELECT NEXTVAL('recibo_seq') AS num");
    const num = seqRes.rows[0].num;
    const year = new Date(fecha).getFullYear();
    const numero = `REC-${year}-${String(num).padStart(4, '0')}`;

    const result = await pool.query(
      `INSERT INTO recibos (numero, cita_id, venta_id, cliente_id, artista_id, fecha, subtotal, iva_porcentaje, iva_importe, total, forma_pago, concepto)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [numero, cita_id || null, venta_id || null, cliente_id || null, artista_id || null,
       fecha, subtotal, iva_porcentaje || 0, iva_importe || 0, total, forma_pago, concepto]
    );
    return result.rows[0];
  },

  async buscarTodos({ fecha_inicio, fecha_fin, artista_id, cliente_id } = {}) {
    const conditions = [];
    const values = [];
    if (fecha_inicio) { values.push(fecha_inicio); conditions.push(`r.fecha >= $${values.length}`); }
    if (fecha_fin) { values.push(fecha_fin); conditions.push(`r.fecha <= $${values.length}`); }
    if (artista_id) { values.push(artista_id); conditions.push(`r.artista_id = $${values.length}`); }
    if (cliente_id) { values.push(cliente_id); conditions.push(`r.cliente_id = $${values.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT r.*,
        cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
        e.nombre || ' ' || e.apellidos AS artista_nombre
       FROM recibos r
       LEFT JOIN clientes cl ON r.cliente_id = cl.id
       LEFT JOIN empleados e ON r.artista_id = e.id
       ${where}
       ORDER BY r.fecha DESC, r.created_at DESC`,
      values
    );
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query(
      `SELECT r.*,
        cl.nombre || ' ' || cl.apellidos AS cliente_nombre,
        e.nombre || ' ' || e.apellidos AS artista_nombre
       FROM recibos r
       LEFT JOIN clientes cl ON r.cliente_id = cl.id
       LEFT JOIN empleados e ON r.artista_id = e.id
       WHERE r.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async generarPDF(id) {
    const recibo = await this.buscarPorId(id);
    if (!recibo) throw new Error('Recibo no encontrado');
    const pdfPath = await generarReciboPdf(recibo);
    await pool.query('UPDATE recibos SET pdf_path=$1 WHERE id=$2', [pdfPath, id]);
    recibo.pdf_path = pdfPath;
    return recibo;
  },

  async actualizarPdf(id, pdf_path) {
    await pool.query('UPDATE recibos SET pdf_path=$1 WHERE id=$2', [pdf_path, id]);
  },
};

module.exports = Recibo;
