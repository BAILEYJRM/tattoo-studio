const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { getMovimientos, registrarMovimiento } = require('../controllers/movimientoController');

router.get('/', auth, getMovimientos);
router.post('/', auth, registrarMovimiento);

module.exports = router;
