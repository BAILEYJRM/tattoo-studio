const router = require('express').Router();
const { getFacturas, getFactura, crearFactura } = require('../controllers/facturaController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/', getFacturas);
router.get('/:id', getFactura);
router.post('/', crearFactura);

module.exports = router;
