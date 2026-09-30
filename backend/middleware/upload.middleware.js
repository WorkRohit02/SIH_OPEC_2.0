const multer = require('multer');

// Memory storage for direct buffer hashing and ImageKit streaming
const storage = multer.memoryStorage();

// Allowed MIME types for evidence media
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`Invalid file type '${file.mimetype}'. Only JPEG, PNG, WEBP images and MP4 videos are allowed.`);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max limit
  },
});

/**
 * Flexible upload middleware wrapper that handles both multipart/form-data and application/json bodies
 */
const optionalSingleUpload = (fieldName) => {
  const single = upload.single(fieldName);
  return (req, res, next) => {
    if (req.is('multipart/form-data')) {
      return single(req, res, next);
    }
    next();
  };
};

module.exports = {
  upload,
  optionalSingleUpload,
};
