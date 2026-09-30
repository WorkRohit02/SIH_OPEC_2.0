const crypto = require('crypto');

/**
 * Calculates SHA-256 hash of a Buffer
 * @param {Buffer} buffer 
 * @returns {string} hex digest
 */
const hashBuffer = (buffer) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError('Expected a Buffer for hashBuffer');
  }
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Calculates SHA-256 hash of a String
 * @param {string} str 
 * @returns {string} hex digest
 */
const hashString = (str) => {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string for hashString');
  }
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
};

/**
 * Calculates SHA-256 hash of a canonicalized JSON Object
 * @param {Object} obj 
 * @param {Function} canonicalizer 
 * @returns {string} hex digest
 */
const hashObject = (obj, canonicalizer) => {
  const canonicalString = canonicalizer ? canonicalizer(obj) : JSON.stringify(obj);
  return hashString(canonicalString);
};

module.exports = {
  hashBuffer,
  hashString,
  hashObject,
};
