const Venta = require('../models/venta');

const getVentas = async (req, res) => {
  try {
    const ventas = await Venta.buscarTodas(req.query);
    res.json(ventas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getVenta = async (req, res) => {
  try {
    const venta = await Venta.buscarPorId(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(venta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearVenta = async (req, res) => {
  try {
    const { lineas, ...ventaDatos } = req.body;
    ventaDatos.empleado_id = req.usuario.id;
    const venta = await Venta.crear(ventaDatos, lineas || []);
    res.status(201).json(venta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarVenta = async (req, res) => {
  try {
    const venta = await Venta.actualizar(req.params.id, req.body);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(venta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getResumenDia = async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
    const resumen = await Venta.resumenDia(fecha);
    res.json(resumen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getResumenMes = async (req, res) => {
  try {
    const now = new Date();
    const year = req.query.year || now.getFullYear();
    const month = req.query.month || (now.getMonth() + 1);
    const resumen = await Venta.resumenMes(year, month);
    res.json(resumen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getVentas, getVenta, crearVenta, actualizarVenta, getResumenDia, getResumenMes };
