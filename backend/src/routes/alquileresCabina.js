const express = require('express');
const router = express.Router();
const AlquilerCabina = require('../models/alquilerCabina');

// Obtener todos los alquileres de cabina
router.get('/', async (req, res) => {
  try {
    const alquileres = await AlquilerCabina.buscarTodos();
    res.json(alquileres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Crear un contrato de alquiler de cabina
router.post('/', async (req, res) => {
  try {
    const nuevo = await AlquilerCabina.crear(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Registrar un pago de alquiler de cabina (Booth Rent)
router.post('/:id/pagar', async (req, res) => {
  try {
    const { monto, metodo_pago, notas } = req.body;
    const actualizado = await AlquilerCabina.registrarPago(req.params.id, monto, metodo_pago, notas);
    res.json(actualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
