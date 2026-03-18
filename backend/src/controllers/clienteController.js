 const Cliente = require('../models/cliente');

const getClientes = async (req, res) => {
  try {
    const { buscar } = req.query;
    const clientes = buscar
      ? await Cliente.buscarPorNombre(buscar)
      : await Cliente.buscarTodos();
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCliente = async (req, res) => {
  try {
    const cliente = await Cliente.buscarPorId(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearCliente = async (req, res) => {
  try {
    const cliente = await Cliente.crear(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.actualizar(req.params.id, req.body);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getClientes, getCliente, crearCliente, actualizarCliente };