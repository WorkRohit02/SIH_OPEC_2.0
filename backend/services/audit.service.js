const AuditLog = require('../models/AuditLog');
const { hashString } = require('../utils/hash');

/**
 * AUDIT SERVICE
 * Records sequential, immutable event logs with hash chain linkage.
 */

/**
 * Creates an audit log entry
 */
const logEvent = async ({ testId = null, recordId = null, operatorId, action, deviceId = 'UNKNOWN_DEVICE', metadata = {} }) => {
  try {
    // Get last audit entry to establish hash chain linkage
    const previousEntry = await AuditLog.findOne().sort({ createdAt: -1 });
    const previousHash = previousEntry ? previousEntry.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';

    const timestamp = new Date();
    const payloadToHash = `${previousHash}|${action}|${operatorId}|${timestamp.toISOString()}|${JSON.stringify(metadata)}`;
    const currentHash = hashString(payloadToHash);

    const auditEntry = await AuditLog.create({
      testId,
      recordId,
      operatorId,
      action,
      timestamp,
      deviceId,
      metadata,
      previousHash,
      currentHash,
    });

    return auditEntry;
  } catch (error) {
    console.error('[Audit Service Error]:', error.message);
    // Audit logging should not crash the main execution unless fatal
    return null;
  }
};

/**
 * Retrieves audit log trail for a specific test ID
 */
const getAuditTrailForTest = async (testId) => {
  return await AuditLog.find({ testId }).sort({ createdAt: 1 });
};

module.exports = {
  logEvent,
  getAuditTrailForTest,
};
