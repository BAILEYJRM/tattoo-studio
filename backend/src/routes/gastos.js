const router = require('express').Router();
const { auth } = require('../middleware/auth');
const {
  getGastos, getGasto, crearGasto, actualizarGasto, eliminarGasto, getResumenMes,
} = require('../controllers/gastoController');

router.get('/resumen-mes', auth, getResumenMes);
router.get('/', auth, getGastos);
router.get('/:id', auth, getGasto);
router.post('/', auth, crearGasto);
router.put('/:id', auth, actualizarGasto);
router.delete('/:id', auth, eliminarGasto);

module.exports = router;
