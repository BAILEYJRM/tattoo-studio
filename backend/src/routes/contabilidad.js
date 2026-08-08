const router = require('express').Router();
const { getRecuentoDiario, getLiquidacionArtista, getLiquidacionEstudio } = require('../controllers/contabilidadController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/recuento-diario', getRecuentoDiario);
router.get('/liquidacion-artista', getLiquidacionArtista);
router.get('/liquidacion-estudio', getLiquidacionEstudio);

module.exports = router;
