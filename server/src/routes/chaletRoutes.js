const express = require('express');
const { getChaletInfo, updateChaletInfo } = require('../controllers/chaletController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/', getChaletInfo);
router.put('/', requireAuth, updateChaletInfo);

module.exports = router;
