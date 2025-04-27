const User = require('../models/userModel');
const Doctor = require('../models/doctorModel');
const Appointment = require('../models/appointmentModel');
const { updateActiveAppointments, updateUsersCount } = require('../middleware/metricsMiddleware');
const { logger } = require('./logger');

/**
 * Initialize metrics on application startup
 * This will ensure that the Grafana dashboards have data from the beginning
 */
const initializeMetrics = async () => {
  try {
    logger.info('Initializing metrics data...');
    
    // Count active appointments
    const activeAppointments = await Appointment.countDocuments({ status: 'scheduled' });
    updateActiveAppointments(activeAppointments);
    logger.info(`Metrics initialized: ${activeAppointments} active appointments`);
    
    // Count users by role
    const patientCount = await User.countDocuments({ role: 'patient' });
    updateUsersCount('patient', patientCount);
    logger.info(`Metrics initialized: ${patientCount} patients`);
    
    const doctorCount = await Doctor.countDocuments();
    updateUsersCount('doctor', doctorCount);
    logger.info(`Metrics initialized: ${doctorCount} doctors`);
    
    const adminCount = await User.countDocuments({ role: 'admin' });
    updateUsersCount('admin', adminCount);
    logger.info(`Metrics initialized: ${adminCount} admins`);
    
    logger.info('All metrics initialized successfully');
  } catch (error) {
    logger.error(`Error initializing metrics: ${error.message}`);
  }
};

module.exports = { initializeMetrics };