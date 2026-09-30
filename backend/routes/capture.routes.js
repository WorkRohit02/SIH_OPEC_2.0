const express = require('express');
const router = express.Router();
const captureController = require('../controllers/capture.controller');
const { protect } = require('../middleware/auth.middleware');
const { optionalSingleUpload } = require('../middleware/upload.middleware');

router.use(protect);

router.post('/:testId', optionalSingleUpload('image'), captureController.uploadCapture);

router.get('/test/:testId', captureController.getCapturesForTest);

module.exports = router;
