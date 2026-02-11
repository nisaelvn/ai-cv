// backend/src/routes/ai.routes.js

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// POST isteği geldiğinde controller'ı çalıştır
router.post('/analyze', aiController.analyzeCv);

module.exports = router;