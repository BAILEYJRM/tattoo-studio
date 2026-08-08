const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads/consentimientos');

function formatearFecha(date) {
  return new Date(date).toLocaleString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

async function generarPdfConsentimiento(consentimiento, plantilla) {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const nombreArchivo = `consentimiento-${consentimiento.id}-${Date.now()}.pdf`;
  const rutaArchivo = path.join(UPLOADS_DIR, nombreArchivo);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    const stream = fs.createWriteStream(rutaArchivo);
    doc.pipe(stream);

    const { datos_cliente, firma_imagen, firmado_en, tipo } = consentimiento;
    const cliente = typeof datos_cliente === 'string' ? JSON.parse(datos_cliente) : datos_cliente;

    // ── Cabecera ────────────────────────────────────────────────────────────
    // Fondo oscuro del encabezado
    doc.rect(0, 0, doc.page.width, 90).fill('#1a1a2e');

    // Título del estudio
    doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold')
      .text('TATTOO STUDIO', 50, 25, { align: 'left' });
    doc.fillColor('#a78bfa').fontSize(10).font('Helvetica')
      .text('Gestión profesional de consentimientos', 50, 50);

    // Tipo de consentimiento en la derecha
    const tipoLabel = {
      tatuaje: 'TATUAJE', piercing: 'PIERCING',
      microblading: 'MICROBLADING', laser: 'ELIMINACIÓN LÁSER',
    }[tipo] || tipo.toUpperCase();
    doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold')
      .text(tipoLabel, 0, 32, { align: 'right', width: doc.page.width - 50 });

    doc.moveDown(3);

    // ── Título del consentimiento ────────────────────────────────────────────
    doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold')
      .text(plantilla.nombre.toUpperCase(), { align: 'center' });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#a78bfa').lineWidth(2).stroke();
    doc.moveDown(0.8);

    // ── Datos del firmante ────────────────────────────────────────────────────
    doc.fillColor('#1a1a2e').fontSize(11).font('Helvetica-Bold').text('DATOS DEL FIRMANTE');
    doc.moveDown(0.4);

    const camposCliente = [
      ['Nombre completo', cliente.nombre || '—'],
      ['DNI / NIE / Pasaporte', cliente.dni || '—'],
      ['Fecha de nacimiento', cliente.fecha_nacimiento || '—'],
      ['Teléfono de contacto', cliente.telefono || '—'],
    ];

    doc.fontSize(10).font('Helvetica');
    camposCliente.forEach(([etiqueta, valor]) => {
      doc.fillColor('#555555').text(`${etiqueta}: `, { continued: true })
        .fillColor('#111111').font('Helvetica-Bold').text(valor).font('Helvetica');
    });

    doc.moveDown(0.8);
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke();
    doc.moveDown(0.8);

    // ── Texto del consentimiento ─────────────────────────────────────────────
    doc.fillColor('#1a1a2e').fontSize(11).font('Helvetica-Bold').text('TEXTO DEL CONSENTIMIENTO INFORMADO');
    doc.moveDown(0.5);

    const lineas = plantilla.contenido.split('\n');
    doc.fontSize(9).font('Helvetica').fillColor('#222222');
    lineas.forEach((linea) => {
      if (linea.trim() === '') {
        doc.moveDown(0.4);
      } else if (/^\d+\./.test(linea.trim())) {
        // Títulos de sección numerados
        doc.moveDown(0.3);
        doc.font('Helvetica-Bold').fillColor('#1a1a2e').text(linea.trim());
        doc.font('Helvetica').fillColor('#222222');
      } else if (linea.trim().startsWith('•')) {
        doc.text(linea.trim(), { indent: 12 });
      } else {
        doc.text(linea.trim());
      }
    });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke();
    doc.moveDown(0.8);

    // ── Firma ────────────────────────────────────────────────────────────────
    doc.fillColor('#1a1a2e').fontSize(11).font('Helvetica-Bold').text('FIRMA DEL CONSENTIMIENTO');
    doc.moveDown(0.5);

    doc.fontSize(9).font('Helvetica').fillColor('#444444')
      .text(`Fecha y hora de firma: ${formatearFecha(firmado_en)}`);
    doc.moveDown(0.5);

    if (firma_imagen) {
      try {
        // La firma viene como data URL: "data:image/png;base64,..."
        const base64Data = firma_imagen.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const firmaY = doc.y;
        // Marco de la firma
        doc.rect(50, firmaY, 250, 100).strokeColor('#cccccc').lineWidth(1).stroke();
        doc.image(buffer, 55, firmaY + 5, { width: 240, height: 90, fit: [240, 90] });
        doc.text('', 50, firmaY + 110);
      } catch (e) {
        doc.fillColor('#999999').text('[Imagen de firma no disponible]');
      }
    } else {
      doc.fillColor('#999999').text('[Sin firma digital]');
    }

    doc.moveDown(0.5);
    doc.fontSize(8).fillColor('#555555')
      .text(`El presente documento ha sido firmado digitalmente el ${formatearFecha(firmado_en)}.`, { align: 'center' })
      .text('Este consentimiento informado tiene validez legal como documento firmado.', { align: 'center' });

    // ── Pie de página (requiere bufferPages: true) ───────────────────────────
    const range = doc.bufferedPageRange();
    const pageCount = range.count;
    for (let i = range.start; i < range.start + pageCount; i++) {
      doc.switchToPage(i);
      const footerY = doc.page.height - 35;
      doc.moveTo(50, footerY - 5).lineTo(doc.page.width - 50, footerY - 5)
        .strokeColor('#e5e7eb').lineWidth(0.5).stroke();
      doc.fillColor('#aaaaaa').fontSize(7)
        .text(`Tattoo Studio — Consentimiento Informado — ${tipoLabel} — Pág. ${i - range.start + 1}/${pageCount}`,
          50, footerY, { align: 'center', width: doc.page.width - 100 });
    }

    doc.flushPages();
    doc.end();
    stream.on('finish', () => resolve(path.join('uploads/consentimientos', nombreArchivo)));
    stream.on('error', reject);
  });
}

module.exports = { generarPdfConsentimiento };
