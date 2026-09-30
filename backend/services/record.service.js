const DigitalRecord = require('../models/DigitalRecord');
const Test = require('../models/Test');
const Capture = require('../models/Capture');
const Analysis = require('../models/Analysis');
const TestProfile = require('../models/TestProfile');
const User = require('../models/User');

const canonicalizeRecord = require('../utils/canonicalizeRecord');
const { generateCanonicalRecordHash } = require('./hash.service');
const { signRecord } = require('./signature.service');
const { logEvent } = require('./audit.service');
const { AUDIT_ACTIONS } = require('../utils/constants');

/**
 * DIGITAL RECORD SERVICE
 * Constructs canonical, cryptographically hashed, and digitally signed evidence records.
 */

/**
 * Creates a DigitalRecord from a completed test
 * 
 * @param {string} testId Test ObjectId
 * @param {string} operatorId Operator ObjectId
 * @returns {Object} Created DigitalRecord document
 */
const createDigitalRecord = async (testId, operatorId) => {
  const isMongoId = typeof testId === 'string' && testId.match(/^[0-9a-fA-F]{24}$/);
  const test = await Test.findOne({
    $or: [{ testId: testId }, { _id: isMongoId ? testId : null }],
  });
  if (!test) {
    throw new Error('Test not found for record generation');
  }


  const profile = await TestProfile.findById(test.testProfileId);
  const capture = test.currentCaptureId ? await Capture.findById(test.currentCaptureId) : await Capture.findOne({ testId: test._id }).sort({ createdAt: -1 });
  const analysis = test.finalResultId ? await Analysis.findById(test.finalResultId) : await Analysis.findOne({ testId: test._id }).sort({ createdAt: -1 });

  if (!analysis) {
    throw new Error('Analysis result must be present to generate a Digital Record');
  }

  const primaryImage = capture && capture.imageFiles && capture.imageFiles.length > 0 
    ? capture.imageFiles[0] 
    : { fileId: 'NO_IMAGE', url: '', sha256: '0000000000000000000000000000000000000000000000000000000000000000' };

  const recordId = `DR-${test.testId}-${Date.now().toString(36).toUpperCase()}`;
  const rawQuality = capture && capture.qualityChecks ? (capture.qualityChecks.toJSON ? capture.qualityChecks.toJSON() : JSON.parse(JSON.stringify(capture.qualityChecks))) : {};
  const rawLocation = test.location ? (test.location.toJSON ? test.location.toJSON() : JSON.parse(JSON.stringify(test.location))) : { latitude: null, longitude: null, accuracy: null };

  // Build canonical record payload object (strictly structured for deterministic hashing)
  const canonicalPayloadObject = {
    recordId,
    testId: test._id.toString(),
    humanReadableTestId: test.testId,
    operatorId: operatorId.toString(),
    deviceId: test.deviceId,
    testProfileCode: profile ? profile.profileCode : 'CP-01',
    profileVersion: profile ? profile.version : '1.0.0',
    timestamp: test.completedAt || new Date(),
    location: rawLocation,
    evidence: {
      imageKitFileId: primaryImage.fileId,
      imageUrl: primaryImage.url,
      sha256: primaryImage.sha256,
    },
    qualityChecks: rawQuality,
    result: analysis.classification,
    modelVersion: analysis.modelVersion,
    calibrationVersion: analysis.calibrationVersion,
    imageHash: primaryImage.sha256,
  };


  // 1. Generate Canonical JSON String & SHA-256 Record Hash
  const { canonicalString, hash: canonicalRecordHash } = generateCanonicalRecordHash(canonicalPayloadObject);

  // 2. Digitally Sign canonical record string using Asymmetric Key Pair
  const digitalSignatureOutput = signRecord(canonicalString);

  // 3. Create DigitalRecord Document in Database
  const digitalRecord = await DigitalRecord.create({
    recordId,
    testId: test._id,
    humanReadableTestId: test.testId,
    operatorId,
    deviceId: test.deviceId,
    testProfileCode: profile ? profile.profileCode : 'CP-01',
    profileVersion: profile ? profile.version : '1.0.0',
    timestamp: canonicalPayloadObject.timestamp,
    location: test.location,
    evidence: canonicalPayloadObject.evidence,
    qualityChecks: capture ? capture.qualityChecks : {},
    analysisSummary: {
      features: analysis.features,
      explanation: analysis.explanation,
      confidence: analysis.confidence,
    },
    result: analysis.classification,
    modelVersion: analysis.modelVersion,
    calibrationVersion: analysis.calibrationVersion,
    imageHash: primaryImage.sha256,
    canonicalRecordHash,
    digitalSignature: digitalSignatureOutput,
    signatureStatus: 'SIGNED',
  });

  // 4. Log Audit Events
  await logEvent({
    testId: test._id,
    recordId: digitalRecord._id,
    operatorId,
    action: AUDIT_ACTIONS.RECORD_CREATED,
    deviceId: test.deviceId,
    metadata: { recordId, canonicalRecordHash },
  });

  await logEvent({
    testId: test._id,
    recordId: digitalRecord._id,
    operatorId,
    action: AUDIT_ACTIONS.RECORD_SIGNED,
    deviceId: test.deviceId,
    metadata: { signatureStatus: 'SIGNED' },
  });

  return digitalRecord;
};

module.exports = {
  createDigitalRecord,
};
