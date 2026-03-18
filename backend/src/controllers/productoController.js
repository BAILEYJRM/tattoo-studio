const Producto = require('../models/producto');

const getProductos = async (req, res) => {
  try {
    const productos = await Producto.buscarTodos();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const buscarProductos = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const productos = await Producto.buscar(q);
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProducto = async (req, res) => {
  try {
    const producto = await Producto.buscarPorId(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearProducto = async (req, res) => {
  try {
    const producto = await Producto.crear(req.body);
    res.status(201).json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const producto = await Producto.actualizar(req.params.id, req.body);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStockBajo = async (req, res) => {
  try {
    const productos = await Producto.stockBajo();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProductos, buscarProductos, getProducto, crearProducto, actualizarProducto, getStockBajo };
