const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { getCabinas, getCabina, crearCabina, actualizarCabina, cambiarEstado } = require('../controllers/cabinaController');

router.get('/', auth, getCabinas);
router.get('/:id', auth, getCabina);
router.post('/', auth, crearCabina);
router.put('/:id', auth, actualizarCabina);
router.patch('/:id/estado', auth, cambiarEstado);

module.exports = router;
