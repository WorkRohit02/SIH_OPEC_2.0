const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/:testId', reportController.downloadReportPDF);
router.post('/:testId', reportController.downloadReportPDF);

module.exports = router;
