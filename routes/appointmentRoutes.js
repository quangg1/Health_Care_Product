const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/available-slots', appointmentController.getAvailableTimeSlots);

// Protected routes
router.use(authMiddleware);

// Create new appointment
router.post('/', appointmentController.createAppointment);

// Get user's appointments
router.get('/', appointmentController.getUserAppointments);

// Get appointment by ID
router.get('/:appointmentId', appointmentController.getAppointmentById);

// Update appointment
router.put('/:appointmentId', appointmentController.updateAppointment);

// Cancel appointment
router.patch('/:appointmentId/cancel', appointmentController.cancelAppointment);

// Admin routes (require admin middleware)
router.get('/admin/statistics', appointmentController.getAppointmentStatistics);

module.exports = router; 