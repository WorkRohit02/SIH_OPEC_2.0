const User = require('../models/User');

/**
 * USER SERVICE
 */

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    const error = new Error('User profile not found.');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateUserProfile = async (userId, updateData) => {
  const allowedFields = ['name', 'phone', 'organization'];
  const filteredData = {};

  for (const key of Object.keys(updateData)) {
    if (allowedFields.includes(key)) {
      filteredData[key] = updateData[key];
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, filteredData, {
    new: true,
    runValidators: true,
  }).select('-passwordHash');

  return updatedUser;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Current password is incorrect.');
    error.statusCode = 400;
    throw error;
  }

  user.passwordHash = await User.hashPassword(newPassword);
  await user.save();

  return { message: 'Password changed successfully' };
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
};
