const mongoose = require('mongoose');
const env = require('./env');

/**
 * Connects to MongoDB database using Mongoose
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
    // In production we exit on database failure
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
