const express = require('express');
const router = express.Router();
const {
    createShortUrl,
    getUrlAnalytics,
    getAllUrls
} = require('../controller/urlController');

router.post('/shorten', createShortUrl);
router.get('/analytics/:shortCode', getUrlAnalytics);
router.get('/urls', getAllUrls);

module.exports = router;