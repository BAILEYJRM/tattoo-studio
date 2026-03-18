 const router = require('express').Router();
const { getClientes, getCliente, crearCliente, actualizarCliente, getHistorialCliente, getDuplicados, fusionarClientes } = require('../controllers/clienteController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/duplicados', getDuplicados);
router.post('/fusionar', fusionarClientes);
router.get('/', getClientes);
router.get('/:id', getCliente);
router.get('/:id/historial', getHistorialCliente);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);

module.exports = router;
