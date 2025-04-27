const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor
 *               - date
 *               - startTime
 *               - endTime
 *               - reason
 *             properties:
 *               doctor:
 *                 type: string
 *                 description: Doctor ID
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of appointment (YYYY-MM-DD)
 *               startTime:
 *                 type: string
 *                 example: "10:00"
 *               endTime:
 *                 type: string
 *                 example: "10:30"
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authorized
 *       409:
 *         description: Time slot not available
 */
router.post('/', protect, appointmentController.createAppointment);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all user appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *         description: Filter by appointment status
 *     responses:
 *       200:
 *         description: List of appointments
 *       401:
 *         description: Not authorized
 */
router.get('/', protect, appointmentController.getUserAppointments);

/**
 * @swagger
 * /api/appointments/doctor:
 *   get:
 *     summary: Get all doctor appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *         description: Filter by appointment status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of appointments
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Not a doctor
 */
router.get('/doctor', protect, authorize('doctor'), appointmentController.getDoctorAppointments);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Appointment not found
 */
router.get('/:id', protect, appointmentController.getAppointmentById);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Time slot not available
 */
router.put('/:id', protect, appointmentController.updateAppointment);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Appointment not found
 */
router.patch('/:id/status', protect, appointmentController.updateAppointmentStatus);

module.exports = router;