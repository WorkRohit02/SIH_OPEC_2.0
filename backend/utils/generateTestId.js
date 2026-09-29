/**
 * Human-readable Test ID Generator (FT-YYYY-XXXXXX)
 * Ensures consistent, auditable, non-sequential unpredictable or padded sequential test identification.
 */

const generateTestId = (sequenceNumber = 1, date = new Date()) => {
  const year = date.getFullYear();
  const paddedSeq = String(sequenceNumber).padStart(6, '0');
  return `FT-${year}-${paddedSeq}`;
};

module.exports = generateTestId;
