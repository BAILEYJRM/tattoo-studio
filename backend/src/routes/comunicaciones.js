const router = require('express').Router();
const { auth } = require('../middleware/auth');
const {
  getComunicaciones, getPlantillas, updatePlantilla, enviarManual, getEstadisticas,
} = require('../controllers/comunicacionController');

router.get('/', auth, getComunicaciones);
router.get('/plantillas', auth, getPlantillas);
router.put('/plantillas/:id', auth, updatePlantilla);
router.post('/enviar', auth, enviarManual);
router.get('/estadisticas', auth, getEstadisticas);

module.exports = router;
