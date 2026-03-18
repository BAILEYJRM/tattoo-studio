 const router = require('express').Router();
const { getClientes, getCliente, crearCliente, actualizarCliente } = require('../controllers/clienteController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', getClientes);
router.get('/:id', getCliente);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);

module.exports = router;