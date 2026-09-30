const captureService = require('../services/capture.service');
const { sendSuccess } = require('../utils/response');

const uploadCapture = async (req, res, next) => {
  try {
    const testId = req.params.testId;
    const file = req.file;

    let qualityChecks = null;
    if (req.body.qualityChecks) {
      try {
        qualityChecks = typeof req.body.qualityChecks === 'string' ? JSON.parse(req.body.qualityChecks) : req.body.qualityChecks;
      } catch (e) {
        qualityChecks = null;
      }
    }

    const capture = await captureService.createCaptureAttempt({
      testId,
      operatorId: req.user.id,
      fileBuffer: file ? file.buffer : null,
      fileName: file ? file.originalname : 'evidence.jpg',
      mimeType: file ? file.mimetype : 'image/jpeg',
      qualityChecks,
      metadata: req.body.metadata || {},
    });

    return sendSuccess(res, 'Capture attempt registered successfully', { capture }, 201);
  } catch (error) {
    next(error);
  }
};

const getCapturesForTest = async (req, res, next) => {
  try {
    const captures = await captureService.getCapturesForTest(req.params.testId);
    return sendSuccess(res, 'Capture attempt history retrieved', { captures }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadCapture,
  getCapturesForTest,
};
