const Analysis = require('../models/Analysis');
const Test = require('../models/Test');
const TestProfile = require('../models/TestProfile');
const { calibrate } = require('./calibration.service');
const { classify } = require('./classification.service');
const { logEvent } = require('./audit.service');
const { AUDIT_ACTIONS, TEST_STATUS } = require('../utils/constants');

/**
 * ANALYSIS SERVICE
 * Orchestrates color feature extraction, calibration, classification, and analysis persistence.
 */

/**
 * Executes colorimetric analysis on a capture attempt
 * 
 * @param {Object} params
 * @param {string} params.testId Test ObjectId
 * @param {string} params.captureId Capture ObjectId
 * @param {Object} params.capturedSamples Captured RGB samples and reference patches
 * @param {Object} params.operatorId Operator ObjectId
 * @returns {Object} Analysis document
 */
const runAnalysis = async ({ testId, captureId, capturedSamples, operatorId }) => {
  const isMongoId = typeof testId === 'string' && testId.match(/^[0-9a-fA-F]{24}$/);
  const test = await Test.findOne({
    $or: [{ testId: testId }, { _id: isMongoId ? testId : null }],
  });
  if (!test) {
    throw new Error('Test not found for analysis execution');
  }


  const profile = await TestProfile.findById(test.testProfileId);
  if (!profile) {
    throw new Error('TestProfile not found for analysis execution');
  }

  // 1. Audit Analysis Started
  await logEvent({
    testId: test._id,
    operatorId,
    action: AUDIT_ACTIONS.ANALYSIS_STARTED,
    deviceId: test.deviceId,
  });

  // Update test status to ANALYSING
  test.status = TEST_STATUS.ANALYSING;
  await test.save();

  // 2. Calibrate captured color features
  const calibrationResult = calibrate(capturedSamples, null);

  if (calibrationResult.calibrationStatus === 'FAILED' || !calibrationResult.calibratedFeatures) {
    const failedAnalysis = await Analysis.create({
      testId: test._id,
      captureId,
      profileId: profile._id,
      features: null,
      classification: 'INCONCLUSIVE',
      confidence: 0.0,
      analysisStatus: 'FAILED',
      error: calibrationResult.message || 'Color calibration failed',
    });

    test.status = TEST_STATUS.INCONCLUSIVE;
    await test.save();

    return failedAnalysis;
  }

  // 3. Classify calibrated features
  const classificationOutput = classify(calibrationResult.calibratedFeatures, profile);

  // 4. Create Analysis record
  const analysisDoc = await Analysis.create({
    testId: test._id,
    captureId,
    profileId: profile._id,
    modelVersion: classificationOutput.modelVersion,
    calibrationVersion: calibrationResult.calibrationVersion,
    features: calibrationResult.calibratedFeatures,
    classification: classificationOutput.classification,
    confidence: classificationOutput.confidence,
    explanation: classificationOutput.explanation,
    analysisStatus: 'SUCCESS',
    completedAt: new Date(),
  });

  // Update Test status and reference final result
  test.finalResultId = analysisDoc._id;
  test.status = classificationOutput.classification === 'INCONCLUSIVE' 
    ? TEST_STATUS.INCONCLUSIVE 
    : TEST_STATUS.COMPLETED;
  test.completedAt = new Date();
  await test.save();

  // 5. Audit Analysis & Result Completed
  await logEvent({
    testId: test._id,
    operatorId,
    action: AUDIT_ACTIONS.ANALYSIS_COMPLETED,
    deviceId: test.deviceId,
    metadata: {
      analysisId: analysisDoc._id,
      classification: classificationOutput.classification,
    },
  });

  return analysisDoc;
};

module.exports = {
  runAnalysis,
};
