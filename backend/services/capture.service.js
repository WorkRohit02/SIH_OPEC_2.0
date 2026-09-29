const Capture = require('../models/Capture');
const Test = require('../models/Test');
const { uploadMedia } = require('./imagekit.service');
const { logEvent } = require('./audit.service');
const { AUDIT_ACTIONS, CAPTURE_STATUS } = require('../utils/constants');

/**
 * CAPTURE SERVICE
 * Handles media evidence upload via ImageKit, attempt tracking, and SHA-256 evidence hashing.
 * Retains all failed and previous attempts for full auditability.
 */

/**
 * Registers a capture attempt and uploads evidence media
 */
const createCaptureAttempt = async ({ testId, operatorId, fileBuffer, fileName, mimeType, qualityChecks, metadata }) => {
  const isMongoId = typeof testId === 'string' && testId.match(/^[0-9a-fA-F]{24}$/);
  const test = await Test.findOne({
    $or: [{ testId: testId }, { _id: isMongoId ? testId : null }],
  });
  if (!test) {
    throw new Error(`Test '${testId}' not found.`);
  }


  // Count existing attempt number
  const previousAttemptCount = await Capture.countDocuments({ testId: test._id });
  const attemptNumber = previousAttemptCount + 1;

  // Log Audit Event Capture Started
  await logEvent({
    testId: test._id,
    operatorId,
    action: AUDIT_ACTIONS.CAPTURE_STARTED,
    deviceId: test.deviceId,
    metadata: { attemptNumber },
  });

  // Evaluate quality check flags if provided
  const parsedQuality = qualityChecks || {
    blurPassed: true,
    exposurePassed: true,
    lightingPassed: true,
    framingPassed: true,
    sharpnessPassed: true,
    referenceCardDetected: true,
    testRegionDetected: true,
  };

  const isQualityPassed = Object.values(parsedQuality).every((v) => v === true);

  if (!fileBuffer) {
    // Register failed capture attempt without media
    const failedCapture = await Capture.create({
      testId: test._id,
      operatorId,
      attemptNumber,
      imageFiles: [],
      qualityChecks: parsedQuality,
      captureStatus: CAPTURE_STATUS.FAILED,
      imageHash: '0000000000000000000000000000000000000000000000000000000000000000',
    });

    await logEvent({
      testId: test._id,
      operatorId,
      action: AUDIT_ACTIONS.CAPTURE_FAILED,
      deviceId: test.deviceId,
      metadata: { attemptNumber, reason: 'Quality checks failed or missing file buffer' },
    });

    return failedCapture;
  }

  // 1. Upload media buffer via ImageKit service (SHA-256 of ORIGINAL evidence generated inside service)
  const mediaMetadata = await uploadMedia(fileBuffer, fileName, mimeType, test.testId, 'ORIGINAL');

  // 2. Save Capture document in MongoDB (References only)
  const capture = await Capture.create({
    testId: test._id,
    operatorId,
    attemptNumber,
    imageFiles: [mediaMetadata],
    qualityChecks: parsedQuality,
    calibrationStatus: isQualityPassed ? 'SUCCESS' : 'FAILED',
    captureStatus: isQualityPassed ? CAPTURE_STATUS.CAPTURED : CAPTURE_STATUS.FAILED,
    imageHash: mediaMetadata.sha256,
  });

  // Update Test document current capture ID
  test.currentCaptureId = capture._id;
  await test.save();

  // Log Audit Event Capture Completed
  await logEvent({
    testId: test._id,
    operatorId,
    action: isQualityPassed ? AUDIT_ACTIONS.CAPTURE_COMPLETED : AUDIT_ACTIONS.CAPTURE_FAILED,
    deviceId: test.deviceId,
    metadata: { attemptNumber, imageHash: mediaMetadata.sha256, captureId: capture._id },
  });

  return capture;
};

/**
 * Gets all capture attempts for a test
 */
const getCapturesForTest = async (testId) => {
  return await Capture.find({ testId }).sort({ attemptNumber: 1 });
};

module.exports = {
  createCaptureAttempt,
  getCapturesForTest,
};
