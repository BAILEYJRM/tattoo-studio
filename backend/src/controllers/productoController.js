const Producto = require('../models/producto');
const pool = require('../config/database');

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

const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM movimientos_stock WHERE producto_id = $1', [id]);
      await client.query('DELETE FROM productos WHERE id = $1', [id]);
      await client.query('COMMIT');
      res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const bulkDeleteProductos = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Se requieren ids para eliminar' });
  }
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM movimientos_stock WHERE producto_id = ANY($1)', [ids]);
      await client.query('DELETE FROM productos WHERE id = ANY($1)', [ids]);
      await client.query('COMMIT');
      res.json({ message: `${ids.length} productos eliminados correctamente` });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProductos, buscarProductos, getProducto, crearProducto, actualizarProducto, getStockBajo, deleteProducto, bulkDeleteProductos };
