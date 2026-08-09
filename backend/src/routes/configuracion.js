const router = require('express').Router();
const { auth, soloAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/configuracionController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/logos'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/publica', ctrl.getConfiguracionPublica);
router.get('/dias-festivos', auth, ctrl.getDiasFestivos);
router.post('/dias-festivos', auth, soloAdmin, ctrl.addDiaFestivo);
router.delete('/dias-festivos/:id', auth, soloAdmin, ctrl.deleteDiaFestivo);
router.get('/', auth, soloAdmin, ctrl.getConfiguracion);
router.put('/', auth, soloAdmin, ctrl.updateConfiguracion);
router.post('/logo', auth, soloAdmin, upload.single('logo'), ctrl.uploadLogo);
router.post('/reiniciar-secuencia-factura', auth, soloAdmin, ctrl.reiniciarSecuenciaFactura);

module.exports = router;
