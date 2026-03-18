const router = require('express').Router();
const { getEmpleados, getEmpleado, crearEmpleado, actualizarEmpleado, desactivarEmpleado } = require('../controllers/empleadoController');
const { crearAusencia, getAusencias, eliminarAusencia } = require('../controllers/ausenciaController');
const { auth, soloAdmin } = require('../middleware/auth');

router.use(auth);

router.get('/', getEmpleados);
router.get('/:id', getEmpleado);
router.post('/', soloAdmin, crearEmpleado);
router.put('/:id', soloAdmin, actualizarEmpleado);
router.delete('/:id', soloAdmin, desactivarEmpleado);

// Ausencias
router.get('/:id/ausencias', getAusencias);
router.post('/:id/ausencias', crearAusencia);

module.exports = router;
