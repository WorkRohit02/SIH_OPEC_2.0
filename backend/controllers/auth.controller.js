const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

/**
 * AUTH CONTROLLER
 */

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return sendSuccess(res, 'Login successful', result, 200);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Authenticated user profile retrieved', { user: req.user }, 200);
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    const tokens = await authService.refreshAccessToken(token);
    return sendSuccess(res, 'Tokens refreshed successfully', tokens, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
};
