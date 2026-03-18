 const router = require('express').Router();
const { getEmpleados, getEmpleado, crearEmpleado, actualizarEmpleado, desactivarEmpleado } = require('../controllers/empleadoController');
const { auth, soloAdmin } = require('../middleware/auth');

router.use(auth);

router.get('/', getEmpleados);
router.get('/:id', getEmpleado);
router.post('/', soloAdmin, crearEmpleado);
router.put('/:id', soloAdmin, actualizarEmpleado);
router.delete('/:id', soloAdmin, desactivarEmpleado);

module.exports = router;