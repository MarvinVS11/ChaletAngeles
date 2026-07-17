const express = require('express');
const { getChaletInfo } = require('../controllers/chaletController');

const router = express.Router();

router.get('/', getChaletInfo);

module.exports = router;
