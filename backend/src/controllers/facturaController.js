const Factura = require('../models/factura');
const Recibo = require('../models/recibo');

const getFacturas = async (req, res) => {
  try {
    const facturas = await Factura.buscarTodas(req.query);
    res.json(facturas);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getFactura = async (req, res) => {
  try {
    const factura = await Factura.buscarPorId(req.params.id);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(factura);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const crearFactura = async (req, res) => {
  try {
    const { recibo_id, datos_cliente, iva_porcentaje } = req.body;

    let base = req.body;
    // Si viene de un recibo, heredar datos
    if (recibo_id) {
      const recibo = await Recibo.buscarPorId(recibo_id);
      if (!recibo) return res.status(404).json({ error: 'Recibo no encontrado' });
      const ivaPct = iva_porcentaje ?? 21;
      const iva = Number(recibo.subtotal) * ivaPct / 100;
      base = {
        recibo_id,
        cliente_id: recibo.cliente_id,
        datos_cliente: datos_cliente || { nombre: recibo.cliente_nombre },
        fecha: recibo.fecha,
        subtotal: recibo.subtotal,
        iva_porcentaje: ivaPct,
        iva_importe: iva.toFixed(2),
        total: (Number(recibo.subtotal) + iva).toFixed(2),
      };
    }

    const factura = await Factura.crear(base);
    res.status(201).json(factura);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getFacturas, getFactura, crearFactura };
