const express = require('express');
const router = express.Router();
const { getInsights } = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

router.get('/insights', authMiddleware, getInsights);

module.exports = router;
