const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const auth = require('../middleware/auth');

// All checkout routes require authentication
router.use(auth);

// POST /api/checkout/create-order - Create order and Razorpay order
router.post('/create-order', checkoutController.createOrder);

// POST /api/checkout/verify - Verify payment signature
router.post('/verify', checkoutController.verifyPayment);

// GET /api/checkout/orders - Get user orders
router.get('/orders', checkoutController.getUserOrders);

// GET /api/checkout/orders/:orderId - Get order details
router.get('/orders/:orderId', checkoutController.getOrderDetails);

// POST /api/checkout/orders/:orderId/cancel - Cancel order
router.post('/orders/:orderId/cancel', checkoutController.cancelOrder);

// POST /api/checkout/orders/:orderId/refund - Process refund (admin only)
router.post('/orders/:orderId/refund', checkoutController.processRefund);

module.exports = router;
