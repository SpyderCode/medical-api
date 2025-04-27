const mongoose = require('mongoose');
const { dbConnectionGauge } = require('../middleware/metricsMiddleware');
const { logger } = require('../utils/logger');

const connectDB = async (retries = 5, delay = 5000) => {
  let connectionAttempt = 0;
  
  const attemptConnection = async () => {
    try {
      connectionAttempt++;
      logger.info(`MongoDB connection attempt ${connectionAttempt} of ${retries}`);
      
      const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-appointments', {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
      });
      
      // Set database connection status to connected (1)
      dbConnectionGauge.set(1);
      
      // Log successful connection
      logger.info(`MongoDB Connected: ${connection.connection.host}`);
      
      // Handle connection events for metrics
      mongoose.connection.on('disconnected', () => {
        dbConnectionGauge.set(0);
        logger.warn('MongoDB disconnected');
      });
      
      mongoose.connection.on('reconnected', () => {
        dbConnectionGauge.set(1);
        logger.info('MongoDB reconnected');
      });
      
      mongoose.connection.on('error', (err) => {
        dbConnectionGauge.set(0);
        logger.error(`MongoDB connection error: ${err.message}`);
      });
      
      return connection;
    } catch (error) {
      // Set database connection status to disconnected (0)
      dbConnectionGauge.set(0);
      logger.error(`Error connecting to database: ${error.message}`);
      
      if (connectionAttempt < retries) {
        logger.info(`Retrying connection in ${delay/1000} seconds...`);
        return new Promise(resolve => {
          setTimeout(() => resolve(attemptConnection()), delay);
        });
      } else {
        logger.error(`Failed to connect to database after ${retries} attempts`);
        // Don't exit process, return null to indicate failure
        return null;
      }
    }
  };
  
  return attemptConnection();
};

module.exports = { connectDB };