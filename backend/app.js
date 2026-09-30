const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const notFound = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
}));

// Cookie Parser
app.use(cookieParser());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use(limiter);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'COLOR-SAFE Backend API Operational',
    timestamp: new Date().toISOString(),
    system: 'COLOR-SAFE Smartphone-Assisted Colorimetric Field Testing',
  });
});

// Placeholders for Route Modules (will be mounted as implemented)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/test-profiles', require('./routes/testProfile.routes'));
app.use('/api/tests', require('./routes/test.routes'));
app.use('/api/captures', require('./routes/capture.routes'));
app.use('/api/analysis', require('./routes/analysis.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/verification', require('./routes/verification.routes'));
app.use('/api/sync', require('./routes/sync.routes'));
app.use('/api/reagents', require('./routes/reagent.routes'));

// 404 Handler
app.use(notFound);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
