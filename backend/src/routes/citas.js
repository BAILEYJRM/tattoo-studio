 
const router = require('express').Router();
const { getCitas, getCita, crearCita, actualizarCita, actualizarEstado } = require('../controllers/citaController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', getCitas);
router.get('/:id', getCita);
router.post('/', crearCita);
router.put('/:id', actualizarCita);
router.patch('/:id/estado', actualizarEstado);

module.exports = router;