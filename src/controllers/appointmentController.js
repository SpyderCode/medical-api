const Appointment = require('../models/appointmentModel');
const Doctor = require('../models/doctorModel');
const User = require('../models/userModel');
const { updateActiveAppointments } = require('../middleware/metricsMiddleware');
const { logger } = require('../utils/logger');

// Helper function to update metrics
const updateAppointmentMetrics = async () => {
  try {
    const activeAppointments = await Appointment.countDocuments({ status: 'scheduled' });
    updateActiveAppointments(activeAppointments);
  } catch (error) {
    logger.error(`Error updating appointment metrics: ${error.message}`);
  }
};

/**
 * @desc    Create new appointment
 * @route   POST /api/appointments
 * @access  Private
 */
const createAppointment = async (req, res) => {
  try {
    const { doctor: doctorId, date, startTime, endTime, reason, notes } = req.body;
    const patientId = req.user._id;

    // Validate doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Validate date and time
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past',
      });
    }

    // Check if day is a working day for doctor
    const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(appointmentDate);
    if (!doctor.workingDays.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: `Doctor does not work on ${dayOfWeek}`,
      });
    }

    // Check if time is within doctor's working hours
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const [docStartHour, docStartMinute] = doctor.workingHours.start.split(':').map(Number);
    const [docEndHour, docEndMinute] = doctor.workingHours.end.split(':').map(Number);

    const appointmentStartMinutes = startHour * 60 + startMinute;
    const appointmentEndMinutes = endHour * 60 + endMinute;
    const doctorStartMinutes = docStartHour * 60 + docStartMinute;
    const doctorEndMinutes = docEndHour * 60 + docEndMinute;

    if (
      appointmentStartMinutes < doctorStartMinutes ||
      appointmentEndMinutes > doctorEndMinutes ||
      appointmentStartMinutes >= appointmentEndMinutes
    ) {
      return res.status(400).json({
        success: false,
        message: 'Appointment time is outside doctor working hours or invalid',
      });
    }

    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59)),
      },
      status: 'scheduled',
      $or: [
        {
          startTime: startTime
        },
        {
          $and: [
            { startTime: { $lt: startTime } },
            { endTime: { $gt: startTime } }
          ]
        },
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: endTime } }
          ]
        },
        {
          $and: [
            { startTime: { $gt: startTime } },
            { endTime: { $lt: endTime } }
          ]
        }
      ]
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked',
      });
    }

    // Create the appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date: appointmentDate,
      startTime,
      endTime,
      reason,
      notes: notes || '',
      createdBy: req.user.role === 'doctor' ? 'doctor' : 'patient',
    });

    // Update metrics
    await updateAppointmentMetrics();
    
    // Log the appointment creation
    logger.info(`Appointment created: ID ${appointment._id} for patient ${patientId} with doctor ${doctorId}`);

    res.status(201).json({
      success: true,
      appointment,
    });
  } catch (error) {
    logger.error(`Error creating appointment: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get user appointments
 * @route   GET /api/appointments
 * @access  Private
 */
const getUserAppointments = async (req, res) => {
  try {
    const { status } = req.query;

    // Filter options
    const filterOptions = { patient: req.user._id };
    if (status) filterOptions.status = status;

    // Get appointments
    const appointments = await Appointment.find(filterOptions)
      .populate('doctor', 'name specialization phone email')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get doctor appointments
 * @route   GET /api/appointments/doctor
 * @access  Private/Doctor
 */
const getDoctorAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;

    // Filter options
    const filterOptions = { doctor: req.user._id };
    if (status) filterOptions.status = status;
    
    if (date) {
      filterOptions.date = {
        $gte: new Date(new Date(date).setHours(0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59)),
      };
    }

    // Get appointments
    const appointments = await Appointment.find(filterOptions)
      .populate('patient', 'name phone email')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if user has access to this appointment
    const isDoctor = req.user.role === 'doctor' && appointment.doctor._id.toString() === req.user._id.toString();
    const isPatient = req.user._id.toString() === appointment.patient._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!(isDoctor || isPatient || isAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment',
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update appointment
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
const updateAppointment = async (req, res) => {
  try {
    const { date, startTime, endTime, reason, notes } = req.body;
    
    // Find appointment
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if user has access to update this appointment
    const isDoctor = req.user.role === 'doctor' && appointment.doctor.toString() === req.user._id.toString();
    const isPatient = req.user._id.toString() === appointment.patient.toString();
    const isAdmin = req.user.role === 'admin';

    if (!(isDoctor || isPatient || isAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment',
      });
    }

    // Can only update if appointment is scheduled
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${appointment.status} appointment`,
      });
    }

    // Update fields if provided
    if (date) {
      const appointmentDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Cannot book appointments in the past',
        });
      }
      
      // Check if day is a working day for doctor
      const doctor = await Doctor.findById(appointment.doctor);
      const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(appointmentDate);
      
      if (!doctor.workingDays.includes(dayOfWeek)) {
        return res.status(400).json({
          success: false,
          message: `Doctor does not work on ${dayOfWeek}`,
        });
      }
      
      appointment.date = appointmentDate;
    }

    // Update time if provided
    if (startTime && endTime) {
      const doctor = await Doctor.findById(appointment.doctor);
      
      // Check if time is within doctor's working hours
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const [docStartHour, docStartMinute] = doctor.workingHours.start.split(':').map(Number);
      const [docEndHour, docEndMinute] = doctor.workingHours.end.split(':').map(Number);

      const appointmentStartMinutes = startHour * 60 + startMinute;
      const appointmentEndMinutes = endHour * 60 + endMinute;
      const doctorStartMinutes = docStartHour * 60 + docStartMinute;
      const doctorEndMinutes = docEndHour * 60 + docEndMinute;

      if (
        appointmentStartMinutes < doctorStartMinutes ||
        appointmentEndMinutes > doctorEndMinutes ||
        appointmentStartMinutes >= appointmentEndMinutes
      ) {
        return res.status(400).json({
          success: false,
          message: 'Appointment time is outside doctor working hours or invalid',
        });
      }

      // Check if the time slot is available
      const existingAppointment = await Appointment.findOne({
        _id: { $ne: req.params.id }, // Exclude current appointment
        doctor: appointment.doctor,
        date: {
          $gte: new Date(new Date(appointment.date).setHours(0, 0, 0)),
          $lt: new Date(new Date(appointment.date).setHours(23, 59, 59)),
        },
        status: 'scheduled',
        $or: [
          {
            startTime: startTime
          },
          {
            $and: [
              { startTime: { $lt: startTime } },
              { endTime: { $gt: startTime } }
            ]
          },
          {
            $and: [
              { startTime: { $lt: endTime } },
              { endTime: { $gt: endTime } }
            ]
          },
          {
            $and: [
              { startTime: { $gt: startTime } },
              { endTime: { $lt: endTime } }
            ]
          }
        ]
      });

      if (existingAppointment) {
        return res.status(409).json({
          success: false,
          message: 'This time slot is already booked',
        });
      }

      appointment.startTime = startTime;
      appointment.endTime = endTime;
    }

    if (reason) appointment.reason = reason;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update appointment status
 * @route   PATCH /api/appointments/:id/status
 * @access  Private
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if user has access to update this appointment
    const isDoctor = req.user.role === 'doctor' && appointment.doctor.toString() === req.user._id.toString();
    const isPatient = req.user._id.toString() === appointment.patient.toString();
    const isAdmin = req.user.role === 'admin';

    if (!(isDoctor || isPatient || isAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment',
      });
    }

    // Only patients can cancel their appointments
    // Doctors can mark appointments as completed or cancelled
    if (status === 'cancelled' && !(isPatient || isDoctor || isAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Only patients or doctors can cancel appointments',
      });
    }

    if (status === 'completed' && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can mark appointments as completed',
      });
    }

    // Update appointment status
    appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();
    
    // Update metrics
    await updateAppointmentMetrics();
    
    // Log the status change
    logger.info(`Appointment ID ${appointment._id} status updated to ${status} by ${req.user.role} ${req.user._id}`);

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    logger.error(`Error updating appointment status: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAppointment,
  getUserAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
};