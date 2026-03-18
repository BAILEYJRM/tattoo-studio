const MovimientoStock = require('../models/movimientoStock');
const Producto = require('../models/producto');

const getMovimientos = async (req, res) => {
  try {
    const { producto_id } = req.query;
    const movimientos = producto_id
      ? await MovimientoStock.buscarPorProducto(producto_id)
      : await MovimientoStock.buscarTodos();
    res.json(movimientos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const registrarMovimiento = async (req, res) => {
  try {
    const { producto_id, tipo, cantidad, motivo, notas } = req.body;
    const empleado_id = req.usuario.id;
    const delta = tipo === 'entrada' ? Number(cantidad) : tipo === 'salida' ? -Number(cantidad) : Number(cantidad);
    await Producto.actualizarStock(producto_id, delta);
    const movimiento = await MovimientoStock.crear({
      producto_id, tipo, cantidad: Math.abs(Number(cantidad)), motivo, notas, empleado_id,
    });
    res.status(201).json(movimiento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMovimientos, registrarMovimiento };
