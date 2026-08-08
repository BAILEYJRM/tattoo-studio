const router = require('express').Router();
const { auth } = require('../middleware/auth');
const {
  getProductos, buscarProductos, getProducto, crearProducto, actualizarProducto, getStockBajo, deleteProducto, bulkDeleteProductos
} = require('../controllers/productoController');

router.get('/buscar', auth, buscarProductos);
router.get('/stock-bajo', auth, getStockBajo);
router.get('/', auth, getProductos);
router.get('/:id', auth, getProducto);
router.post('/', auth, crearProducto);
router.put('/:id', auth, actualizarProducto);
router.delete('/:id', auth, deleteProducto);
router.post('/bulk-delete', auth, bulkDeleteProductos);

module.exports = router;
