const router = require('express').Router();
const { getEventos, getEvento, crearEvento, actualizarEvento, eliminarEvento } = require('../controllers/eventoCalendarioController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', getEventos);
router.get('/:id', getEvento);
router.post('/', crearEvento);
router.put('/:id', actualizarEvento);
router.delete('/:id', eliminarEvento);

module.exports = router;
