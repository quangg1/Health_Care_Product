const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create new order
router.post('/', orderController.createOrder);

// Get user's order history
router.get('/', orderController.getUserOrders);

// Get order by ID
router.get('/:orderId', orderController.getOrderById);

// Cancel order
router.patch('/:orderId/cancel', orderController.cancelOrder);

// Reorder an existing order
router.post('/:orderId/reorder', orderController.reorder);

// Admin routes (require admin middleware)
router.patch('/:orderId/status', orderController.updateOrderStatus);
router.get('/admin/statistics', orderController.getOrderStatistics);

module.exports = router;