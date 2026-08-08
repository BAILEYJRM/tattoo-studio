const router = require('express').Router();
const { auth } = require('../middleware/auth');
const {
  getVentas, getVenta, crearVenta, actualizarVenta, getResumenDia, getResumenMes,
} = require('../controllers/ventaController');

router.get('/resumen-dia', auth, getResumenDia);
router.get('/resumen-mes', auth, getResumenMes);
router.get('/', auth, getVentas);
router.get('/:id', auth, getVenta);
router.post('/', auth, crearVenta);
router.put('/:id', auth, actualizarVenta);

module.exports = router;
