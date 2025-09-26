const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

// All cart routes require authentication
router.use(auth);

// GET /api/cart - Get user's cart
router.get('/', cartController.getCart);

// POST /api/cart - Add item to cart
router.post('/', cartController.addToCart);

// PUT /api/cart/:productId - Update cart item quantity
router.put('/:productId', cartController.updateCartItem);

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', cartController.removeFromCart);

// DELETE /api/cart - Clear entire cart
router.delete('/', cartController.clearCart);

// POST /api/cart/sync - Sync localStorage cart with server
router.post('/sync', cartController.syncCart);

module.exports = router;
