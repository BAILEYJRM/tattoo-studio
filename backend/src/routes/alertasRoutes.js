const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertasController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, alertasController.getAllAlertas);
router.post('/scan', verifyToken, alertasController.scanAlertas);
router.put('/:id/resolver', verifyToken, alertasController.resolverAlerta);

module.exports = router;
