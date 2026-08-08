const router = require('express').Router();
const { auth } = require('../middleware/auth');
const {
  getResumen, getRendimientoArtistas, getTopClientes,
  getEvolucionMensual, getDistribucionEdades, getMetodosPago, getImpactoEco,
} = require('../controllers/estadisticasController');

router.get('/resumen',           auth, getResumen);
router.get('/artistas',          auth, getRendimientoArtistas);
router.get('/top-clientes',      auth, getTopClientes);
router.get('/evolucion-mensual', auth, getEvolucionMensual);
router.get('/edades',            auth, getDistribucionEdades);
router.get('/metodos-pago',      auth, getMetodosPago);
router.get('/eco',               auth, getImpactoEco);

module.exports = router;
