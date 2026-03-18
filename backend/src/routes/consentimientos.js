const router = require('express').Router();
const { auth } = require('../middleware/auth');
const {
  getConsentimientos, getConsentimiento, crearConsentimiento, descargarPdf, regenerarPdf, enviarEmailConsentimiento,
} = require('../controllers/consentimientoController');

router.get('/', auth, getConsentimientos);
router.get('/:id', auth, getConsentimiento);
router.get('/:id/pdf', auth, descargarPdf);
router.post('/', auth, crearConsentimiento);
router.post('/:id/regenerar-pdf', auth, regenerarPdf);
router.post('/:id/enviar-email', auth, enviarEmailConsentimiento);

module.exports = router;
