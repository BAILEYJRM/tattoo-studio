const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads/recibos');

function fmtEur(n) { return `${Number(n || 0).toFixed(2)} €`; }

function fmtFecha(d) {
  return new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function generarReciboPdf(recibo) {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  const nombreArchivo = `recibo-${recibo.numero}-${Date.now()}.pdf`;
  const rutaArchivo = path.join(UPLOADS_DIR, nombreArchivo);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    const stream = fs.createWriteStream(rutaArchivo);
    doc.pipe(stream);

    const W = doc.page.width;

    // ── Cabecera ─────────────────────────────────────────────────────────────
    doc.rect(0, 0, W, 80).fill('#1a1a2e');
    doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('TATTOO STUDIO', 50, 22);
    doc.fillColor('#a78bfa').fontSize(9).font('Helvetica').text('Gestión profesional', 50, 46);
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold')
      .text('RECIBO', 0, 28, { align: 'right', width: W - 50 });
    doc.moveDown(3);

    // ── Número y fecha ────────────────────────────────────────────────────────
    const y0 = doc.y;
    doc.fillColor('#111111').fontSize(11).font('Helvetica-Bold').text('Nº Recibo:', 50, y0);
    doc.fillColor('#6366f1').text(recibo.numero, 130, y0);
    doc.fillColor('#111111').fontSize(11).font('Helvetica-Bold').text('Fecha:', 0, y0, { align: 'right', width: W - 50 - 80 });
    doc.fillColor('#333333').font('Helvetica').text(fmtFecha(recibo.fecha), 0, y0, { align: 'right', width: W - 50 });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(W - 50, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke();
    doc.moveDown(0.8);

    // ── Cliente ───────────────────────────────────────────────────────────────
    if (recibo.cliente_nombre) {
      doc.fillColor('#1a1a2e').fontSize(9).font('Helvetica-Bold').text('CLIENTE');
      doc.moveDown(0.3);
      doc.fillColor('#333333').fontSize(10).font('Helvetica').text(recibo.cliente_nombre);
      doc.moveDown(0.8);
      doc.moveTo(50, doc.y).lineTo(W - 50, doc.y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
      doc.moveDown(0.8);
    }

    // ── Artista ───────────────────────────────────────────────────────────────
    if (recibo.artista_nombre) {
      doc.fillColor('#1a1a2e').fontSize(9).font('Helvetica-Bold').text('ARTISTA');
      doc.moveDown(0.3);
      doc.fillColor('#333333').fontSize(10).font('Helvetica').text(recibo.artista_nombre);
      doc.moveDown(0.8);
      doc.moveTo(50, doc.y).lineTo(W - 50, doc.y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
      doc.moveDown(0.8);
    }

    // ── Concepto ─────────────────────────────────────────────────────────────
    doc.fillColor('#1a1a2e').fontSize(9).font('Helvetica-Bold').text('CONCEPTO');
    doc.moveDown(0.3);
    doc.fillColor('#333333').fontSize(10).font('Helvetica').text(recibo.concepto || '—');
    doc.moveDown(1.2);

    // ── Totales ───────────────────────────────────────────────────────────────
    const lineaImporte = (label, valor, bold, color) => {
      const yL = doc.y;
      doc.fillColor(color || '#555555').fontSize(10)
        .font(bold ? 'Helvetica-Bold' : 'Helvetica').text(label, 300, yL);
      doc.fillColor(bold ? '#111111' : '#444444').font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .text(fmtEur(valor), 0, yL, { align: 'right', width: W - 50 });
      doc.moveDown(0.5);
    };

    doc.moveTo(300, doc.y).lineTo(W - 50, doc.y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    doc.moveDown(0.5);

    lineaImporte('Subtotal', recibo.subtotal);
    lineaImporte(`IVA (${recibo.iva_porcentaje || 0}%)`, recibo.iva_importe);

    doc.moveDown(0.3);
    doc.rect(295, doc.y - 4, W - 295 - 45, 28).fill('#1a1a2e');
    const yTotal = doc.y;
    doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold')
      .text('TOTAL', 302, yTotal);
    doc.text(fmtEur(recibo.total), 0, yTotal, { align: 'right', width: W - 52 });
    doc.moveDown(2.5);

    // ── Forma de pago ─────────────────────────────────────────────────────────
    doc.moveTo(50, doc.y).lineTo(W - 50, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke();
    doc.moveDown(0.8);
    doc.fillColor('#555555').fontSize(9).font('Helvetica-Bold').text('Forma de pago:', 50, doc.y, { continued: true });
    const fpLabel = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', bizum: 'Bizum', transferencia: 'Transferencia' };
    doc.fillColor('#111111').font('Helvetica').text(` ${fpLabel[recibo.forma_pago] || recibo.forma_pago || '—'}`);

    // ── Pie de página ─────────────────────────────────────────────────────────
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const fy = doc.page.height - 30;
      doc.moveTo(50, fy - 5).lineTo(W - 50, fy - 5).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
      doc.fillColor('#aaaaaa').fontSize(7)
        .text(`Tattoo Studio · Recibo ${recibo.numero} · Pág. ${i - range.start + 1}/${range.count}`,
          50, fy, { align: 'center', width: W - 100 });
    }

    doc.flushPages();
    doc.end();
    stream.on('finish', () => resolve(path.join('uploads/recibos', nombreArchivo)));
    stream.on('error', reject);
  });
}

module.exports = { generarReciboPdf };
