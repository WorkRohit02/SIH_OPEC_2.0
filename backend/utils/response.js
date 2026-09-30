/**
 * Standardized API Response Helper
 */

const sendSuccess = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message = 'An error occurred', statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) => {
  const response = {
    success: false,
    message,
    error: {
      code: errorCode,
      details: details || message,
    },
  };

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
