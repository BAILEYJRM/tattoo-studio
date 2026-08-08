const Gasto = require('../models/gasto');
const Producto = require('../models/producto');
const MovimientoStock = require('../models/movimientoStock');

const getGastos = async (req, res) => {
  try {
    const gastos = await Gasto.buscarTodos(req.query);
    res.json(gastos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getGasto = async (req, res) => {
  try {
    const gasto = await Gasto.buscarPorId(req.params.id);
    if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json(gasto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearGasto = async (req, res) => {
  try {
    const empleado_id = req.usuario.id;
    const { agregar_inventario, cantidad_inventario, ...datos } = req.body;
    datos.empleado_id = empleado_id;
    const gasto = await Gasto.crear(datos);

    if (datos.tipo === 'inversion' && agregar_inventario && datos.producto_id && cantidad_inventario) {
      await Producto.actualizarStock(datos.producto_id, Number(cantidad_inventario));
      await MovimientoStock.crear({
        producto_id: datos.producto_id,
        tipo: 'entrada',
        cantidad: Number(cantidad_inventario),
        motivo: 'compra',
        referencia_id: gasto.id,
        empleado_id,
      });
    }

    res.status(201).json(gasto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarGasto = async (req, res) => {
  try {
    const gasto = await Gasto.actualizar(req.params.id, req.body);
    if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json(gasto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const eliminarGasto = async (req, res) => {
  try {
    await Gasto.eliminar(req.params.id);
    res.json({ message: 'Gasto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getResumenMes = async (req, res) => {
  try {
    const now = new Date();
    const year = req.query.year || now.getFullYear();
    const month = req.query.month || (now.getMonth() + 1);
    const resumen = await Gasto.resumenMes(year, month);
    const totales = await Gasto.totalMes(year, month);
    res.json({ desglose: resumen, total: totales.total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getGastos, getGasto, crearGasto, actualizarGasto, eliminarGasto, getResumenMes };
