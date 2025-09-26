const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Artisan = require('../models/Artisan');
const Payout = require('../models/Payout');
const razorpayService = require('../services/razorpayService');

/**
 * Create order and Razorpay order
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shippingAddress, paymentMethod = 'razorpay', coupon } = req.body;

    // Validate user
    const user = await User.findById(userId).populate('cart.items.productId');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate items and calculate totals
    const orderItems = [];
    let subtotal = 0;
    const sellerTotals = {};

    for (const item of items) {
      const product = await Product.findById(item.productId).populate('sellerId');
      if (!product || product.status !== 'active') {
        return res.status(400).json({ 
          message: `Product ${item.productId} not found or unavailable` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.title}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      // Track seller totals
      const sellerId = product.sellerId._id.toString();
      if (!sellerTotals[sellerId]) {
        sellerTotals[sellerId] = {
          sellerId: product.sellerId._id,
          sellerName: product.sellerId.name,
          amount: 0
        };
      }
      sellerTotals[sellerId].amount += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.title,
        productImage: product.images[0]?.url,
        quantity: item.quantity,
        price: product.price,
        sellerId: product.sellerId._id,
        sellerName: product.sellerId.name,
        variant: item.variant || null,
        sku: product.sku || null
      });
    }

    // Calculate taxes and shipping
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const shipping = subtotal >= 500 ? 0 : 50; // Free shipping above ₹500
    const grandTotal = subtotal + tax + shipping;

    // Create order in database
    const order = new Order({
      userId,
      userEmail: user.email,
      userName: user.name,
      items: orderItems,
      totals: {
        subtotal,
        tax,
        shipping,
        discounts: 0, // TODO: Implement coupon system
        grandTotal
      },
      shippingAddress,
      status: 'PENDING_PAYMENT'
    });

    await order.save();

    // Create Razorpay order
    const razorpayOrderData = {
      amount: grandTotal * 100, // Convert to paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        userId: userId,
        sellerCount: Object.keys(sellerTotals).length
      }
    };

    // TODO: Enable marketplace features in Razorpay dashboard
    // TODO: Set up seller accounts with Razorpay Connect
    // Uncomment below when marketplace features are enabled:
    /*
    const sellerSplits = Object.values(sellerTotals).map(seller => ({
      sellerId: seller.sellerId,
      sellerName: seller.sellerName,
      sellerAccountId: 'acc_' + seller.sellerId, // Razorpay account ID
      amount: seller.amount * 100, // Convert to paise
      orderId: order._id.toString()
    }));
    
    razorpayOrderData.transfers = razorpayService.createMarketplaceTransfers(sellerSplits);
    */

    const razorpayOrder = await razorpayService.createOrder(razorpayOrderData);

    // Update order with Razorpay details
    order.razorpay.orderId = razorpayOrder.id;
    order.razorpay.status = 'created';
    await order.save();

    // Create payout records for each seller
    const payouts = [];
    for (const sellerData of Object.values(sellerTotals)) {
      const platformFee = razorpayService.calculatePlatformFee(sellerData.amount);
      const netAmount = razorpayService.calculateSellerPayout(sellerData.amount);

      const payout = new Payout({
        sellerId: sellerData.sellerId,
        sellerName: sellerData.sellerName,
        sellerEmail: 'seller@example.com', // TODO: Get from seller profile
        amount: sellerData.amount,
        platformFee,
        netAmount,
        orderIds: [order._id],
        settlementPeriod: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        },
        method: 'razorpay_transfer'
      });

      await payout.save();
      payouts.push(payout);
    }

    // Update order with payout references
    order.payouts = payouts.map(payout => ({
      sellerId: payout.sellerId,
      sellerName: payout.sellerName,
      amount: payout.amount,
      transferId: null,
      status: 'pending'
    }));

    await order.save();

    res.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: grandTotal,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Verify payment and update order status
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Find order
    const order = await Order.findOne({ 'razorpay.orderId': razorpayOrderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify payment signature
    const isSignatureValid = razorpayService.verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isSignatureValid) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Get payment details from Razorpay
    const payment = await razorpayService.getPayment(razorpayPaymentId);
    
    // Update order with payment details
    order.razorpay.paymentId = razorpayPaymentId;
    order.razorpay.signature = razorpaySignature;
    order.razorpay.status = payment.status;
    order.razorpay.method = payment.method;
    order.razorpay.capturedAt = new Date();
    order.status = 'PAID';

    // Reduce product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // Update seller metrics
    const sellerIds = [...new Set(order.items.map(item => item.sellerId))];
    await Artisan.updateMany(
      { _id: { $in: sellerIds } },
      { 
        $inc: { 
          totalSales: order.totals.grandTotal,
          totalOrders: 1 
        } 
      }
    );

    await order.save();

    // TODO: Send confirmation email to user
    // TODO: Send notification to sellers
    // TODO: Schedule payout processing

    res.json({
      message: 'Payment verified successfully',
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user orders
 */
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.productId', 'title images')
      .populate('items.sellerId', 'name shopName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get order details
 */
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ 
      _id: orderId, 
      userId 
    })
    .populate('items.productId', 'title images description')
    .populate('items.sellerId', 'name shopName phone email')
    .populate('payouts.sellerId', 'name email bankDetails');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error getting order details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Cancel order
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ 
      _id: orderId, 
      userId 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.canBeCancelled()) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    // Update order status
    await order.updateStatus('CANCELLED', 'Cancelled by user');

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    // If payment was made, initiate refund
    if (order.razorpay.paymentId && order.razorpay.status === 'captured') {
      try {
        const refund = await razorpayService.createRefund(
          order.razorpay.paymentId,
          null,
          `Refund for cancelled order ${order.orderNumber}`
        );

        order.razorpay.status = 'refunded';
        order.razorpay.refundedAt = new Date();
        order.razorpay.refundAmount = refund.amount;
        await order.save();

        // TODO: Send refund notification to user
      } catch (refundError) {
        console.error('Error processing refund:', refundError);
        // TODO: Handle refund failure - manual intervention required
      }
    }

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Process refund (admin only)
 */
const processRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.canBeRefunded()) {
      return res.status(400).json({ 
        message: 'Order cannot be refunded at this stage' 
      });
    }

    const refundAmount = amount || order.totals.grandTotal;
    const refund = await razorpayService.createRefund(
      order.razorpay.paymentId,
      refundAmount * 100, // Convert to paise
      reason || `Refund for order ${order.orderNumber}`
    );

    order.razorpay.status = 'refunded';
    order.razorpay.refundedAt = new Date();
    order.razorpay.refundAmount = refund.amount / 100; // Convert back to rupees
    order.status = 'REFUNDED';
    await order.save();

    // TODO: Reverse seller payouts if already processed
    // TODO: Send refund notification to user

    res.json({ 
      message: 'Refund processed successfully',
      refundId: refund.id,
      refundAmount: refund.amount / 100
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  processRefund
};
