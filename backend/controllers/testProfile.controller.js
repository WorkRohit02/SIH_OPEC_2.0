const testProfileService = require('../services/testProfile.service');
const { sendSuccess } = require('../utils/response');

const listProfiles = async (req, res, next) => {
  try {
    const profiles = await testProfileService.getActiveProfiles();
    return sendSuccess(res, 'Active test profiles retrieved', { profiles }, 200);
  } catch (error) {
    next(error);
  }
};

const getProfileByCode = async (req, res, next) => {
  try {
    const profile = await testProfileService.getProfileByCode(req.params.profileCode);
    return sendSuccess(res, 'Test profile retrieved', { profile }, 200);
  } catch (error) {
    next(error);
  }
};

const createProfile = async (req, res, next) => {
  try {
    const profile = await testProfileService.createProfile(req.body, req.user.id);
    return sendSuccess(res, 'Test profile created successfully', { profile }, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProfiles,
  getProfileByCode,
  createProfile,
};
