const router = require('express').Router();
const { login, registro, forgotPassword, resetPassword, registroPublico } = require('../controllers/authController');
const { auth, soloAdmin } = require('../middleware/auth');

router.post('/login', login);
router.post('/registro', auth, soloAdmin, registro);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/registro-publico', registroPublico);

module.exports = router;