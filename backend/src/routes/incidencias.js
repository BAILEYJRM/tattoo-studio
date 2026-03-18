const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const { getIncidencias, crearIncidencia, resolver, actualizarIncidencia } = require('../controllers/incidenciaController');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/incidencias'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `incidencia-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', auth, getIncidencias);
router.post('/', auth, upload.single('foto'), crearIncidencia);
router.put('/:id', auth, actualizarIncidencia);
router.patch('/:id/resolver', auth, resolver);

module.exports = router;
