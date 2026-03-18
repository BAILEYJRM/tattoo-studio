const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { getLimpiezas, getResumenHoy, crearLimpieza, actualizarLimpieza, eliminarLimpieza } = require('../controllers/limpiezaController');

router.get('/resumen', auth, getResumenHoy);
router.get('/', auth, getLimpiezas);
router.post('/', auth, crearLimpieza);
router.put('/:id', auth, actualizarLimpieza);
router.delete('/:id', auth, eliminarLimpieza);

module.exports = router;
