const mongoose = require('mongoose');
const env = require('./env');

/**
 * Connects to MongoDB database with graceful offline/standalone fallback
 */
const connectDB = async () => {
  // 1. Try configured MONGODB_URI
  if (env.MONGODB_URI) {
    try {
      const conn = await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.warn(`[Database] MONGODB_URI connection failed (${error.message}). Trying local MongoDB...`);
    }
  }

  // 2. Try Local MongoDB instance
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/color_safe', { serverSelectionTimeoutMS: 2000 });
    console.log(`[Database] Local MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (localError) {
    console.warn(`[Database] Local MongoDB unavailable (${localError.message}). Attempting MongoMemoryServer...`);
  }

  // 3. Try In-Memory MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[Database] In-Memory MongoDB Connected: ${uri}`);
    return conn;
  } catch (memError) {
    console.warn(`[Database] Standalone API Mode active. Backend running in resilient offline mode (${memError.message}).`);
    return null;
  }
};

module.exports = connectDB;
