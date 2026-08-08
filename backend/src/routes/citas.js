const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { getCitas, getCita, crearCita, actualizarCita, actualizarEstado, finalizarCita, subirImagenCita, getImagenesCita, verificarSolapamiento, crearCitasGrupo } = require('../controllers/citaController');
const { getMaterialCita, registrarMaterial, eliminarMaterial } = require('../controllers/citaMaterialController');
const { auth } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/citas'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cita-${req.params.id}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(auth);

router.get('/verificar-solapamiento', verificarSolapamiento);
router.post('/grupo', crearCitasGrupo);
router.get('/', getCitas);
router.get('/:id', getCita);
router.post('/', crearCita);
router.put('/:id', actualizarCita);
router.patch('/:id/estado', actualizarEstado);
router.patch('/:id/finalizar', finalizarCita);
router.get('/:id/imagenes', getImagenesCita);
router.post('/:id/imagenes', upload.single('imagen'), subirImagenCita);
router.get('/:id/material', getMaterialCita);
router.post('/:id/material', registrarMaterial);
router.delete('/:cita_id/material/:material_id', eliminarMaterial);

module.exports = router;
