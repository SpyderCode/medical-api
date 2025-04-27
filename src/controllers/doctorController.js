const Doctor = require('../models/doctorModel');
const Appointment = require('../models/appointmentModel');

/**
 * @desc    Register a new doctor
 * @route   POST /api/doctors
 * @access  Public
 */
const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, licenseNumber, workingHours, workingDays } = req.body;

    // Check if doctor already exists
    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return res.status(400).json({
        success: false,
        message: 'Doctor already exists with that email',
      });
    }

    // Check if license number is already registered
    const licenseExists = await Doctor.findOne({ licenseNumber });
    if (licenseExists) {
      return res.status(400).json({
        success: false,
        message: 'This license number is already registered',
      });
    }

    // Create new doctor
    const doctor = await Doctor.create({
      name,
      email,
      password,
      phone,
      specialization,
      licenseNumber,
      workingHours,
      workingDays,
    });

    // Generate token
    const token = doctor.createJWT();

    res.status(201).json({
      success: true,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        workingHours: doctor.workingHours,
        workingDays: doctor.workingDays,
        role: doctor.role,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Login doctor
 * @route   POST /api/doctors/login
 * @access  Public
 */
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find doctor by email
    const doctor = await Doctor.findOne({ email }).select('+password');
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await doctor.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = doctor.createJWT();

    res.status(200).json({
      success: true,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        workingHours: doctor.workingHours,
        workingDays: doctor.workingDays,
        role: doctor.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get doctor profile
 * @route   GET /api/doctors/profile
 * @access  Private/Doctor
 */
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user._id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        workingHours: doctor.workingHours,
        workingDays: doctor.workingDays,
        role: doctor.role,
        createdAt: doctor.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update doctor profile
 * @route   PUT /api/doctors/profile
 * @access  Private/Doctor
 */
const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user._id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Update doctor fields if provided
    if (req.body.name) doctor.name = req.body.name;
    if (req.body.email) doctor.email = req.body.email;
    if (req.body.phone) doctor.phone = req.body.phone;
    if (req.body.specialization) doctor.specialization = req.body.specialization;
    if (req.body.workingHours) doctor.workingHours = req.body.workingHours;
    if (req.body.workingDays) doctor.workingDays = req.body.workingDays;
    
    // Only update password if provided
    if (req.body.password) doctor.password = req.body.password;

    // Save updated doctor
    await doctor.save();

    res.status(200).json({
      success: true,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        workingHours: doctor.workingHours,
        workingDays: doctor.workingDays,
        role: doctor.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all doctors
 * @route   GET /api/doctors
 * @access  Public
 */
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select('-__v');
    
    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors: doctors.map(doctor => ({
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        workingHours: doctor.workingHours,
        workingDays: doctor.workingDays,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-__v');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        workingHours: doctor.workingHours,
        workingDays: doctor.workingDays,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get doctor's availability
 * @route   GET /api/doctors/:id/availability
 * @access  Public
 */
const getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    // Validate date format
    if (!date || !Date.parse(date)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date (YYYY-MM-DD)',
      });
    }

    // Find doctor
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Check if the day is a working day for the doctor
    const requestedDate = new Date(date);
    const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(requestedDate);
    
    if (!doctor.workingDays.includes(dayOfWeek)) {
      return res.status(200).json({
        success: true,
        message: `Doctor does not work on ${dayOfWeek}`,
        availableSlots: [],
      });
    }

    // Get doctor's appointments for the requested date
    const appointments = await Appointment.find({
      doctor: id,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59)),
      },
      status: 'scheduled',
    });

    // Generate time slots based on doctor's working hours
    const workingHours = doctor.workingHours;
    const startHour = parseInt(workingHours.start.split(':')[0]);
    const startMinute = parseInt(workingHours.start.split(':')[1] || 0);
    const endHour = parseInt(workingHours.end.split(':')[0]);
    const endMinute = parseInt(workingHours.end.split(':')[1] || 0);

    const slotDuration = 30; // 30 minutes per slot
    const slots = [];

    // Generate all possible time slots
    for (let h = startHour; h < endHour || (h === endHour && startMinute < endMinute); h++) {
      for (let m = h === startHour ? startMinute : 0; m < 60; m += slotDuration) {
        if (h === endHour && m >= endMinute) break;
        
        const startTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const endTimeMinutes = (m + slotDuration) % 60;
        const endTimeHour = h + Math.floor((m + slotDuration) / 60);
        const endTime = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinutes.toString().padStart(2, '0')}`;
        
        // Check if slot is already booked
        const isBooked = appointments.some(app => 
          app.startTime === startTime || 
          (app.startTime < startTime && app.endTime > startTime)
        );

        if (!isBooked) {
          slots.push({
            startTime,
            endTime
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      date,
      doctorId: doctor._id,
      doctorName: doctor.name,
      availableSlots: slots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerDoctor,
  loginDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  getAllDoctors,
  getDoctorById,
  getDoctorAvailability,
};