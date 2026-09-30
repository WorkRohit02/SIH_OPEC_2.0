const { hashBuffer, hashString, hashObject } = require('../utils/hash');
const canonicalizeRecord = require('../utils/canonicalizeRecord');

/**
 * HASH SERVICE
 * Provides SHA-256 cryptographic hashing for evidence images and digital records.
 */

/**
 * Hashes original evidence file buffer
 * @param {Buffer} fileBuffer 
 * @returns {string} SHA-256 hex digest
 */
const hashEvidenceBuffer = (fileBuffer) => {
  return hashBuffer(fileBuffer);
};

/**
 * Generates canonical SHA-256 record hash for a record object
 * @param {Object} recordData 
 * @returns {Object} { canonicalString, hash }
 */
const generateCanonicalRecordHash = (recordData) => {
  const canonicalString = canonicalizeRecord(recordData);
  const hash = hashString(canonicalString);
  return { canonicalString, hash };
};

module.exports = {
  hashEvidenceBuffer,
  generateCanonicalRecordHash,
  hashString,
};
