// server.js
const http = require('http');
const app = require('./app');
const env = require('./config/env');

const PORT = env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});
