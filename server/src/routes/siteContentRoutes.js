const express = require('express');
const { getSiteContent, updateSiteContent } = require('../controllers/siteContentController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/', getSiteContent);
router.put('/', requireAuth, updateSiteContent);

module.exports = router;
