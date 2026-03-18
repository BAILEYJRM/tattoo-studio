const path = require('path');
const fs = require('fs');
const Consentimiento = require('../models/consentimiento');
const PlantillaConsentimiento = require('../models/plantillaConsentimiento');
const { generarPdfConsentimiento } = require('../utils/generarPdf');

const getConsentimientos = async (req, res) => {
  try {
    const { buscar, tipo, cliente_id } = req.query;
    let consentimientos;
    if (buscar) {
      consentimientos = await Consentimiento.buscarPorCliente(buscar);
    } else {
      consentimientos = await Consentimiento.buscarTodos({ tipo, cliente_id });
    }
    res.json(consentimientos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getConsentimiento = async (req, res) => {
  try {
    const c = await Consentimiento.buscarPorId(req.params.id);
    if (!c) return res.status(404).json({ error: 'Consentimiento no encontrado' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearConsentimiento = async (req, res) => {
  try {
    const { plantilla_id, tipo, datos_cliente, firma_imagen, cliente_id, cita_id } = req.body;
    const empleado_id = req.usuario.id;

    // Obtener plantilla para el PDF
    const plantilla = await PlantillaConsentimiento.buscarPorId(plantilla_id);
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' });

    // Crear registro (sin pdf_path aún)
    const consentimiento = await Consentimiento.crear({
      cliente_id: cliente_id || null,
      cita_id: cita_id || null,
      plantilla_id,
      tipo,
      datos_cliente,
      firma_imagen,
      pdf_path: null,
      empleado_id,
    });

    // Generar PDF antes de responder
    const pdfPath = await generarPdfConsentimiento(consentimiento, plantilla);
    await Consentimiento.actualizarPdf(consentimiento.id, pdfPath);
    consentimiento.pdf_path = pdfPath;

    res.status(201).json(consentimiento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const descargarPdf = async (req, res) => {
  try {
    const c = await Consentimiento.buscarPorId(req.params.id);
    if (!c) return res.status(404).json({ error: 'Consentimiento no encontrado' });
    if (!c.pdf_path) return res.status(404).json({ error: 'PDF no generado aún' });

    const rutaAbsoluta = path.join(__dirname, '../../', c.pdf_path);
    if (!fs.existsSync(rutaAbsoluta)) {
      // Regenerar si no existe
      const plantilla = await PlantillaConsentimiento.buscarPorId(c.plantilla_id);
      const pdfPath = await generarPdfConsentimiento(c, plantilla);
      await Consentimiento.actualizarPdf(c.id, pdfPath);
      const nuevaRuta = path.join(__dirname, '../../', pdfPath);
      return res.download(nuevaRuta, `consentimiento-${c.id}.pdf`);
    }

    res.download(rutaAbsoluta, `consentimiento-${c.id}.pdf`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const regenerarPdf = async (req, res) => {
  try {
    const c = await Consentimiento.buscarPorId(req.params.id);
    if (!c) return res.status(404).json({ error: 'Consentimiento no encontrado' });

    const plantilla = await PlantillaConsentimiento.buscarPorId(c.plantilla_id);
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' });

    const pdfPath = await generarPdfConsentimiento(c, plantilla);
    await Consentimiento.actualizarPdf(c.id, pdfPath);

    res.json({ pdf_path: pdfPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const enviarEmailConsentimiento = async (req, res) => {
  try {
    const { enviarConsentimientoFirmado } = require('../services/emailService');
    const c = await Consentimiento.buscarPorId(req.params.id);
    if (!c) return res.status(404).json({ error: 'Consentimiento no encontrado' });
    const ok = await enviarConsentimientoFirmado(req.params.id);
    if (ok) res.json({ ok: true, mensaje: 'Email enviado' });
    else res.status(422).json({ ok: false, mensaje: 'No se pudo enviar (cliente sin email o plantilla inactiva)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getConsentimientos, getConsentimiento, crearConsentimiento, descargarPdf, regenerarPdf, enviarEmailConsentimiento };
