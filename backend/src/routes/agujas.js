const router = require('express').Router();
const { auth, soloAdmin } = require('../middleware/auth');
const {
  getAgujas, getCaducidadProxima, getAguja, createAguja, updateAguja, deleteAguja,
  getDefectosArtista, addDefectoArtista, removeDefectoArtista,
} = require('../controllers/agujaController');

router.get('/caducidad-proxima', auth, getCaducidadProxima);
router.get('/artista/:empleado_id/defecto', auth, getDefectosArtista);
router.post('/artista/:empleado_id/defecto', auth, addDefectoArtista);
router.delete('/artista/:empleado_id/defecto/:aguja_id', auth, removeDefectoArtista);

router.get('/', auth, getAgujas);
router.get('/:id', auth, getAguja);
router.post('/', auth, createAguja);
router.put('/:id', auth, updateAguja);
router.delete('/:id', auth, soloAdmin, deleteAguja);

module.exports = router;
