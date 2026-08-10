const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const auth = require('../middleware/auth'); // Optionally require auth middleware

router.get('/status', syncController.syncStatus);
router.post('/google', syncController.syncGoogle);
router.post('/goldie', syncController.syncGoldie);

module.exports = router;
