const testService = require('../services/test.service');
const { sendSuccess } = require('../utils/response');

const createTest = async (req, res, next) => {
  try {
    const { testProfileCode, deviceId, location, appVersion } = req.body;
    
    // Always derive authenticated operatorId from req.user.id
    const test = await testService.createTest({
      operatorId: req.user.id,
      testProfileCode,
      deviceId,
      location,
      appVersion,
    });

    return sendSuccess(res, 'Field test initiated successfully', { test }, 201);
  } catch (error) {
    next(error);
  }
};

const getTest = async (req, res, next) => {
  try {
    const test = await testService.getTestById(req.params.id, req.user);
    return sendSuccess(res, 'Field test details retrieved', { test }, 200);
  } catch (error) {
    next(error);
  }
};

const listTests = async (req, res, next) => {
  try {
    const result = await testService.listTests(req.user, req.query);
    return sendSuccess(res, 'Field tests list retrieved', result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTest,
  getTest,
  listTests,
};
