const express = require('express');
const router = express.Router();
const testController = require('../controllers/test.controller');
const captureController = require('../controllers/capture.controller');
const reportController = require('../controllers/report.controller');

const { protect } = require('../middleware/auth.middleware');
const { optionalSingleUpload } = require('../middleware/upload.middleware');
const validate = require('../middleware/validation.middleware');
const { createTestValidator } = require('../utils/validators');

router.use(protect);

router.post('/', createTestValidator, validate, testController.createTest);
router.get('/', testController.listTests);
router.get('/:id', testController.getTest);

// Capture & Report sub-routes attached to test lifecycle
router.post('/:testId/captures', optionalSingleUpload('image'), captureController.uploadCapture);

router.get('/:testId/captures', captureController.getCapturesForTest);
router.get('/:testId/report', reportController.downloadReportPDF);
router.post('/:testId/report', reportController.downloadReportPDF);

module.exports = router;
