const DigitalRecord = require('../models/DigitalRecord');
const canonicalizeRecord = require('../utils/canonicalizeRecord');
const { hashString } = require('../utils/hash');
const { verifySignature } = require('./signature.service');
const { logEvent } = require('./audit.service');
const { AUDIT_ACTIONS } = require('../utils/constants');

/**
 * VERIFICATION SERVICE
 * Verifies evidentiary integrity, SHA-256 hash matches, and RSA digital signatures.
 */

/**
 * Verifies a DigitalRecord's integrity
 * @param {string} recordId Human readable recordId or ObjectId
 * @param {string} operatorId User verifying the record
 * @returns {Object} Integrity verification report { status: 'VALID'|'INVALID', checks: {...}, statement }
 */
const verifyRecordIntegrity = async (recordId, operatorId = null) => {
  const isMongoId = typeof recordId === 'string' && recordId.match(/^[0-9a-fA-F]{24}$/);
  const record = await DigitalRecord.findOne({
    $or: [{ recordId: recordId }, { _id: isMongoId ? recordId : null }],
  });


  if (!record) {
    return {
      status: 'INVALID',
      message: 'Digital record not found in system repository.',
      checks: {
        recordExists: false,
        canonicalHashValid: false,
        digitalSignatureValid: false,
        imageHashValid: false,
      },
    };
  }

  const rawQuality = record.qualityChecks ? JSON.parse(JSON.stringify(record.qualityChecks)) : {};
  const rawLocation = record.location ? JSON.parse(JSON.stringify(record.location)) : { latitude: null, longitude: null, accuracy: null };

  // 1. Re-construct canonical payload object matching original schema
  const canonicalPayloadObject = {
    recordId: record.recordId,
    testId: record.testId.toString(),
    humanReadableTestId: record.humanReadableTestId,
    operatorId: record.operatorId.toString(),
    deviceId: record.deviceId,
    testProfileCode: record.testProfileCode,
    profileVersion: record.profileVersion,
    timestamp: record.timestamp,
    location: rawLocation,
    evidence: {
      imageKitFileId: record.evidence ? record.evidence.imageKitFileId : '',
      imageUrl: record.evidence ? record.evidence.imageUrl : '',
      sha256: record.evidence ? record.evidence.sha256 : '',
    },
    qualityChecks: rawQuality,
    result: record.result,
    modelVersion: record.modelVersion,
    calibrationVersion: record.calibrationVersion,
    imageHash: record.imageHash,
  };


  // 2. Re-calculate canonical record hash
  const canonicalString = canonicalizeRecord(canonicalPayloadObject);
  const recomputedHash = hashString(canonicalString);

  const isCanonicalHashValid = recomputedHash === record.canonicalRecordHash;

  // 3. Verify RSA Digital Signature
  let isSignatureValid = false;
  if (record.digitalSignature && record.digitalSignature.signature) {
    isSignatureValid = verifySignature(canonicalString, record.digitalSignature.signature);
  }

  // 4. Verify Image Hash present
  const isImageHashValid = Boolean(record.imageHash && record.imageHash.length === 64);

  const overallValid = isCanonicalHashValid && isSignatureValid && isImageHashValid;
  const status = overallValid ? 'VALID' : 'INVALID';

  // Audit event log for record verification
  if (operatorId) {
    await logEvent({
      testId: record.testId,
      recordId: record._id,
      operatorId,
      action: AUDIT_ACTIONS.RECORD_VERIFIED,
      metadata: { verificationStatus: status, isCanonicalHashValid, isSignatureValid },
    });
  }

  return {
    status,
    message: overallValid 
      ? 'Digital record integrity successfully verified. Cryptographic hashes and digital signature are intact.'
      : 'Record integrity check failed. Data tampering or signature mismatch detected.',
    checks: {
      recordExists: true,
      canonicalHashValid: isCanonicalHashValid,
      digitalSignatureValid: isSignatureValid,
      imageHashValid: isImageHashValid,
    },
    disclaimer: 'A valid digital hash and signature confirm that stored data has not been modified since creation. Cryptographic validity does NOT verify that the chemical field test itself was executed correctly.',
  };
};

module.exports = {
  verifyRecordIntegrity,
};
