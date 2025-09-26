const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Get user's cart
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: 'cart.items.productId',
      select: 'title price images stock status sellerId',
      populate: {
        path: 'sellerId',
        select: 'name shopName rating'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out products that are no longer available
    const availableItems = user.cart.items.filter(item => 
      item.productId && 
      item.productId.status === 'active' && 
      item.productId.stock >= item.quantity
    );

    // Update cart if items were filtered out
    if (availableItems.length !== user.cart.items.length) {
      user.cart.items = availableItems;
      await user.save();
    }

    // Calculate totals
    let subtotal = 0;
    const cartItems = availableItems.map(item => {
      const itemTotal = item.productId.price * item.quantity;
      subtotal += itemTotal;
      
      return {
        id: item._id,
        productId: item.productId._id,
        productName: item.productId.title,
        productImage: item.productId.images[0]?.url,
        price: item.productId.price,
        quantity: item.quantity,
        variant: item.variant,
        seller: {
          id: item.productId.sellerId._id,
          name: item.productId.sellerId.name,
          shopName: item.productId.sellerId.shopName
        },
        itemTotal,
        stock: item.productId.stock
      };
    });

    const tax = Math.round(subtotal * 0.18); // 18% GST
    const shipping = subtotal >= 500 ? 0 : 50; // Free shipping above ₹500
    const grandTotal = subtotal + tax + shipping;

    res.json({
      items: cartItems,
      totals: {
        subtotal,
        tax,
        shipping,
        grandTotal
      },
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Add item to cart
 */
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, variant = null } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ message: 'Product not found or unavailable' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if item already exists in cart
    const existingItemIndex = user.cart.items.findIndex(
      item => item.productId.toString() === productId && item.variant === variant
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      const newQuantity = user.cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      
      user.cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      user.cart.items.push({
        productId,
        quantity,
        variant
      });
    }

    await user.save();

    res.json({ 
      message: 'Item added to cart successfully',
      cartItemCount: user.cart.items.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update cart item quantity
 */
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cartItem = user.cart.items.find(
      item => item.productId.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check stock availability
    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    cartItem.quantity = quantity;
    await user.save();

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Remove item from cart
 */
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart.items = user.cart.items.filter(
      item => item.productId.toString() !== productId
    );

    await user.save();

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Clear entire cart
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart.items = [];
    await user.save();

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Sync localStorage cart with server cart
 */
const syncCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body; // Array of { productId, quantity, variant }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate all products exist and are available
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ 
      _id: { $in: productIds },
      status: 'active'
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'Some products are not available' });
    }

    // Check stock for each item
    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.productId);
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.title}` 
        });
      }
    }

    // Replace cart items
    user.cart.items = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      variant: item.variant || null
    }));

    await user.save();

    res.json({ message: 'Cart synced successfully' });
  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
};
