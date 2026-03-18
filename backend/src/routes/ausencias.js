const router = require('express').Router();
const { eliminarAusencia, getAusenciasRango } = require('../controllers/ausenciaController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', getAusenciasRango);
router.delete('/:id', eliminarAusencia);

module.exports = router;
