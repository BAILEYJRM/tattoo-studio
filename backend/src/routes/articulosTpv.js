const express = require('express');
const router = express.Router();
const articuloTpvController = require('../controllers/articuloTpvController');

router.get('/', articuloTpvController.obtenerTodos);
router.get('/:id', articuloTpvController.obtenerPorId);
router.post('/', articuloTpvController.crear);
router.put('/:id', articuloTpvController.actualizar);
router.delete('/:id', articuloTpvController.borrar);

module.exports = router;
