const verificationService = require('../services/verification.service');
const { sendSuccess } = require('../utils/response');

const verifyRecord = async (req, res, next) => {
  try {
    const recordId = req.params.recordId;
    const report = await verificationService.verifyRecordIntegrity(recordId, req.user ? req.user.id : null);
    return sendSuccess(res, report.message, { verificationReport: report }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyRecord,
};
