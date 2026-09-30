const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    return sendSuccess(res, 'Profile retrieved successfully', { user }, 200);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    return sendSuccess(res, 'Profile updated successfully', { user: updatedUser }, 200);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
    return sendSuccess(res, result.message, {}, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
