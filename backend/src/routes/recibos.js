const router = require('express').Router();
const { getRecibos, getRecibo, crearRecibo, regenerarPdf } = require('../controllers/reciboController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/', getRecibos);
router.get('/:id', getRecibo);
router.post('/', crearRecibo);
router.post('/:id/pdf', regenerarPdf);

module.exports = router;
