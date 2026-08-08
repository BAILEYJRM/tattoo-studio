const router = require('express').Router();
const { auth, soloAdmin } = require('../middleware/auth');
const {
  getPlantillas, getPlantilla, crearPlantilla, actualizarPlantilla,
} = require('../controllers/plantillaConsentimientoController');

router.get('/', auth, getPlantillas);
router.get('/:id', auth, getPlantilla);
router.post('/', auth, soloAdmin, crearPlantilla);
router.put('/:id', auth, soloAdmin, actualizarPlantilla);

module.exports = router;
