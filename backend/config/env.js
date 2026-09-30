const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });


const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/color_safe_db',
  JWT_SECRET: process.env.JWT_SECRET || 'color_safe_default_jwt_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'color_safe_default_refresh_secret',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY || '',
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY || '',
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT || '',
  RSA_PRIVATE_KEY: process.env.RSA_PRIVATE_KEY || '',
  RSA_PUBLIC_KEY: process.env.RSA_PUBLIC_KEY || '',
};

/**
 * Validate presence of vital environment variables in production
 */
const validateEnv = () => {
  if (env.NODE_ENV === 'production') {
    const requiredVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'IMAGEKIT_PUBLIC_KEY',
      'IMAGEKIT_PRIVATE_KEY',
      'IMAGEKIT_URL_ENDPOINT',
    ];
    const missing = requiredVars.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      console.warn(`[WARN] Missing critical production environment variables: ${missing.join(', ')}`);
    }
  }
};

validateEnv();

module.exports = env;
