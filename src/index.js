const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database connection
const { connectDB } = require('./config/database');

// Import utilities and middleware
const { logger, stream } = require('./utils/logger');
const { errorHandler, notFound } = require('./utils/errorHandler');
const { metricsMiddleware, metricsEndpoint, dbConnectionGauge } = require('./middleware/metricsMiddleware');
const { initializeMetrics } = require('./utils/initMetrics');

// Import routes
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Import Swagger documentation
const swaggerDocs = require('./docs/swagger');

// Initialize Express app
const app = express();

// Connect to database
connectDB()
  .then((connection) => {
    if (connection) {
      // Initialize metrics after successful database connection
      initializeMetrics();
      logger.info('Metrics initialized successfully');
    } else {
      // Even if the connection failed, continue running the app
      // but set the db connection gauge to 0
      dbConnectionGauge.set(0);
      logger.warn('Application running with no database connection. Some features will be limited.');
    }
  })
  .catch((err) => {
    // Log the error but continue running the app
    dbConnectionGauge.set(0);
    logger.error(`Unhandled error in database connection: ${err.message}`);
    logger.warn('Application running with no database connection. Some features will be limited.');
  });

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cors());
app.use(morgan('combined', { stream }));
app.use(helmet()); // Set security headers

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Apply metrics middleware to track requests
app.use(metricsMiddleware);

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Metrics endpoint for Prometheus
app.get('/metrics', metricsEndpoint);

// Health check endpoint for Kubernetes
app.get('/health', (req, res) => {
  // Return healthy even if database is disconnected
  // This allows the pod to stay running so metrics can be scraped
  res.status(200).json({
    status: 'healthy',
    dbConnected: require('mongoose').connection.readyState === 1, // 0 = disconnected, 1 = connected
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Medical Appointment API',
    documentation: '/api-docs',
    health: '/health',
    metrics: '/metrics',
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  // Don't exit the process, just log the error
  // server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  // Only exit on truly fatal errors
  if (err.code === 'EADDRINUSE') {
    logger.fatal('Port already in use, exiting process');
    process.exit(1);
  }
});

module.exports = { app };