const router = require('express').Router();
const { auth, soloAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/configuracionController');

router.get('/publica', ctrl.getConfiguracionPublica);
router.get('/dias-festivos', auth, ctrl.getDiasFestivos);
router.post('/dias-festivos', auth, soloAdmin, ctrl.addDiaFestivo);
router.delete('/dias-festivos/:id', auth, soloAdmin, ctrl.deleteDiaFestivo);
router.get('/', auth, soloAdmin, ctrl.getConfiguracion);
router.put('/', auth, soloAdmin, ctrl.updateConfiguracion);

module.exports = router;
