const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');
const env = require('../config/env');

/**
 * AUTH CONTROLLER
 */

/**
 * Cookie options for token storage
 */
const getCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: maxAgeMs,
  path: '/',
});

/**
 * Sets access and refresh tokens as httpOnly cookies on the response
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
  // accessToken cookie — 7 days (matches JWT_EXPIRES_IN default)
  res.cookie('accessToken', accessToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  // refreshToken cookie — 30 days (matches JWT_REFRESH_EXPIRES_IN default)
  res.cookie('refreshToken', refreshToken, getCookieOptions(30 * 24 * 60 * 60 * 1000));
};

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    setTokenCookies(res, result.accessToken, result.refreshToken);
    return sendSuccess(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    setTokenCookies(res, result.accessToken, result.refreshToken);
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
    // Accept refresh token from body OR cookie
    const token = req.body.refreshToken || req.cookies.refreshToken;

    if (!token) {
      const error = new Error('Refresh token is required.');
      error.statusCode = 400;
      throw error;
    }

    const tokens = await authService.refreshAccessToken(token);
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    return sendSuccess(res, 'Tokens refreshed successfully', tokens, 200);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    return sendSuccess(res, 'Logged out successfully', {}, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
  logout,
};
