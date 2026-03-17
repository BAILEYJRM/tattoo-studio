const router = require('express').Router();
const { login, registro } = require('../controllers/authController');
const { auth, soloAdmin } = require('../middleware/auth');

router.post('/login', login);
router.post('/registro', auth, soloAdmin, registro);

module.exports = router;