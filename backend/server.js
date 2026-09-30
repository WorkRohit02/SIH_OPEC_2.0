// server.js
const http = require('http');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const PORT = env.PORT || 5000;

const server = http.createServer(app);

// Connect to MongoDB first, then start listening
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`❌ Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  });
