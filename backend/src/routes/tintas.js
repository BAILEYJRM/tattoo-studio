const router = require('express').Router();
const { auth, soloAdmin } = require('../middleware/auth');
const {
  getTintas, getCaducidadProxima, getTinta, createTinta, updateTinta, deleteTinta,
  getDefectosArtista, addDefectoArtista, removeDefectoArtista,
} = require('../controllers/tintaController');

// Rutas específicas ANTES de /:id para evitar conflictos
router.get('/caducidad-proxima', auth, getCaducidadProxima);
router.get('/artista/:empleado_id/defecto', auth, getDefectosArtista);
router.post('/artista/:empleado_id/defecto', auth, addDefectoArtista);
router.delete('/artista/:empleado_id/defecto/:tinta_id', auth, removeDefectoArtista);

router.get('/', auth, getTintas);
router.get('/:id', auth, getTinta);
router.post('/', auth, createTinta);
router.put('/:id', auth, updateTinta);
router.delete('/:id', auth, soloAdmin, deleteTinta);

module.exports = router;
