const syncService = require('../services/sync.service');
const { sendSuccess } = require('../utils/response');

const syncRecords = async (req, res, next) => {
  try {
    const { records, deviceId } = req.body;
    const result = await syncService.syncBatchRecords(records, req.user.id, deviceId);
    return sendSuccess(res, 'Offline records synchronization completed', { syncSummary: result }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  syncRecords,
};
