const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysis.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/:captureId/analyse', analysisController.runAnalysis);

module.exports = router;
