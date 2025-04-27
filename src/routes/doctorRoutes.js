const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const doctorController = require('../controllers/doctorController');

const router = express.Router();

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Register a new doctor
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *               - specialization
 *               - licenseNumber
 *               - workingHours
 *               - workingDays
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               phone:
 *                 type: string
 *               specialization:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               workingHours:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     example: "09:00"
 *                   end:
 *                     type: string
 *                     example: "17:00"
 *               workingDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 *       400:
 *         description: Invalid request data
 */
router.post('/', doctorController.registerDoctor);

/**
 * @swagger
 * /api/doctors/login:
 *   post:
 *     summary: Login a doctor
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', doctorController.loginDoctor);

/**
 * @swagger
 * /api/doctors/profile:
 *   get:
 *     summary: Get doctor profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor profile retrieved successfully
 *       401:
 *         description: Not authorized
 */
router.get('/profile', protect, authorize('doctor'), doctorController.getDoctorProfile);

/**
 * @swagger
 * /api/doctors/profile:
 *   put:
 *     summary: Update doctor profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               specialization:
 *                 type: string
 *               workingHours:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                   end:
 *                     type: string
 *               workingDays:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Doctor profile updated successfully
 *       401:
 *         description: Not authorized
 */
router.put('/profile', protect, authorize('doctor'), doctorController.updateDoctorProfile);

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of doctors
 */
router.get('/', doctorController.getAllDoctors);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor details
 *       404:
 *         description: Doctor not found
 */
router.get('/:id', doctorController.getDoctorById);

/**
 * @swagger
 * /api/doctors/{id}/availability:
 *   get:
 *     summary: Get doctor availability
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Doctor ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Doctor availability
 *       404:
 *         description: Doctor not found
 */
router.get('/:id/availability', doctorController.getDoctorAvailability);

module.exports = router;