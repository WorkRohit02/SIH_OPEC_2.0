const Test = require('../models/Test');
const Capture = require('../models/Capture');
const Analysis = require('../models/Analysis');
const DigitalRecord = require('../models/DigitalRecord');
const TestProfile = require('../models/TestProfile');
const { logEvent } = require('./audit.service');
const { AUDIT_ACTIONS, TEST_STATUS } = require('../utils/constants');

/**
 * OFFLINE SYNCHRONIZATION SERVICE
 * Handles batch processing of field test records generated offline by the mobile application.
 * Ensures strict idempotency: duplicate uploads do not create duplicate database records.
 */

/**
 * Synchronizes offline generated test record payloads
 * 
 * @param {Array} records Array of locally created test objects
 * @param {string} operatorId Authenticated operator ObjectId
 * @param {string} deviceId Field device hardware identifier
 * @returns {Object} Sync status report { syncedCount, duplicateCount, failedCount, records: [...] }
 */
const syncBatchRecords = async (records, operatorId, deviceId) => {
  let syncedCount = 0;
  let duplicateCount = 0;
  let failedCount = 0;
  const results = [];

  for (const item of records) {
    try {
      const localTestId = item.localTestId || item.testId;
      if (!localTestId) {
        failedCount++;
        results.push({ localTestId: 'UNKNOWN', status: 'FAILED', reason: 'Missing testId in payload' });
        continue;
      }

      // Check if test already exists (by human readable testId or local reference)
      const existingTest = await Test.findOne({
        $or: [{ testId: localTestId }, { _id: item.mongoId || null }],
      });

      if (existingTest) {
        duplicateCount++;
        results.push({
          localTestId,
          serverTestId: existingTest.testId,
          status: 'SKIPPED_DUPLICATE',
          message: 'Record already synced previously.',
        });
        continue;
      }

      // Find or default TestProfile
      const profileCode = item.testProfileCode || 'CP-01';
      let profile = await TestProfile.findOne({ profileCode });
      if (!profile) {
        profile = await TestProfile.findOne({ status: 'PROTOTYPE' });
      }

      // Create Test Document
      const newTest = await Test.create({
        testId: localTestId,
        operatorId,
        deviceId: deviceId || item.deviceId || 'OFFLINE_DEVICE',
        testProfileId: profile._id,
        status: item.status || TEST_STATUS.SYNCED,
        startedAt: item.startedAt || new Date(),
        completedAt: item.completedAt || new Date(),
        location: item.location || { latitude: null, longitude: null, accuracy: null },
        appVersion: item.appVersion || '1.0.0',
      });

      // Create Capture Document if provided
      let captureDoc = null;
      if (item.capture) {
        captureDoc = await Capture.create({
          testId: newTest._id,
          operatorId,
          attemptNumber: item.capture.attemptNumber || 1,
          imageFiles: item.capture.imageFiles || [],
          qualityChecks: item.capture.qualityChecks || {},
          calibrationStatus: item.capture.calibrationStatus || 'NOT_APPLIED',
          captureStatus: 'CAPTURED',
          imageHash: item.capture.imageHash || '0000000000000000000000000000000000000000000000000000000000000000',
        });
        newTest.currentCaptureId = captureDoc._id;
      }

      // Create Analysis Document if provided
      let analysisDoc = null;
      if (item.analysis) {
        analysisDoc = await Analysis.create({
          testId: newTest._id,
          captureId: captureDoc ? captureDoc._id : newTest._id,
          profileId: profile._id,
          modelVersion: item.analysis.modelVersion || 'v1.0.0-prototype',
          calibrationVersion: item.analysis.calibrationVersion || 'v1.0.0-prototype',
          features: item.analysis.features || {},
          classification: item.analysis.classification || 'INCONCLUSIVE',
          confidence: item.analysis.confidence || 0.5,
          explanation: item.analysis.explanation || 'Synced offline test result',
          analysisStatus: 'SUCCESS',
        });
        newTest.finalResultId = analysisDoc._id;
      }

      await newTest.save();

      // Create DigitalRecord if provided
      if (item.digitalRecord) {
        await DigitalRecord.create({
          recordId: item.digitalRecord.recordId || `DR-${newTest.testId}`,
          testId: newTest._id,
          humanReadableTestId: newTest.testId,
          operatorId,
          deviceId: newTest.deviceId,
          testProfileCode: profile.profileCode,
          profileVersion: profile.version,
          timestamp: item.digitalRecord.timestamp || new Date(),
          location: newTest.location,
          evidence: item.digitalRecord.evidence || {},
          qualityChecks: item.digitalRecord.qualityChecks || {},
          result: item.digitalRecord.result || (analysisDoc ? analysisDoc.classification : 'INCONCLUSIVE'),
          modelVersion: item.digitalRecord.modelVersion || 'v1.0.0-prototype',
          calibrationVersion: item.digitalRecord.calibrationVersion || 'v1.0.0-prototype',
          imageHash: item.digitalRecord.imageHash || '0000000000000000000000000000000000000000000000000000000000000000',
          canonicalRecordHash: item.digitalRecord.canonicalRecordHash || '0000000000000000000000000000000000000000000000000000000000000000',
          digitalSignature: item.digitalRecord.digitalSignature || { signature: 'OFFLINE_SIGNATURE', algorithm: 'RSA-SHA256-PROTOTYPE' },
          signatureStatus: 'SIGNED',
        });
      }

      // Log Audit Event
      await logEvent({
        testId: newTest._id,
        operatorId,
        action: AUDIT_ACTIONS.SYNCED,
        deviceId: newTest.deviceId,
        metadata: { localTestId, syncTimestamp: new Date() },
      });

      syncedCount++;
      results.push({
        localTestId,
        serverTestId: newTest.testId,
        status: 'SUCCESS',
      });
    } catch (err) {
      failedCount++;
      results.push({
        localTestId: item.localTestId || 'UNKNOWN',
        status: 'FAILED',
        reason: err.message,
      });
    }
  }

  return {
    syncedCount,
    duplicateCount,
    failedCount,
    results,
  };
};

module.exports = {
  syncBatchRecords,
};
