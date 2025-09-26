const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {Object} orderData - Order details
 * @param {number} orderData.amount - Amount in paise
 * @param {string} orderData.currency - Currency code (default: INR)
 * @param {string} orderData.receipt - Receipt ID
 * @param {Object} orderData.notes - Additional notes
 * @param {Array} orderData.transfers - Transfer details for marketplace
 * @returns {Promise<Object>} Razorpay order response
 */
const createOrder = async (orderData) => {
  try {
    const {
      amount,
      currency = 'INR',
      receipt,
      notes = {},
      transfers = null
    } = orderData;

    const orderOptions = {
      amount: Math.round(amount), // Ensure amount is in paise
      currency,
      receipt,
      notes,
      // Add transfers if marketplace features are enabled
      ...(transfers && { transfers })
    };

    console.log('Creating Razorpay order with options:', orderOptions);
    
    const order = await razorpay.orders.create(orderOptions);
    
    console.log('Razorpay order created:', order.id);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
};

/**
 * Verify Razorpay payment signature
 * @param {string} razorpayOrderId - Razorpay order ID
 * @param {string} razorpayPaymentId - Razorpay payment ID
 * @param {string} razorpaySignature - Payment signature
 * @returns {boolean} Signature verification result
 */
const verifySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpaySignature;
    
    console.log('Signature verification:', {
      expected: expectedSignature,
      received: razorpaySignature,
      isValid: isSignatureValid
    });

    return isSignatureValid;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

/**
 * Capture a payment (if order was created as authorize-only)
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to capture in paise
 * @returns {Promise<Object>} Capture response
 */
const capturePayment = async (paymentId, amount) => {
  try {
    const captureOptions = {
      amount: Math.round(amount),
      currency: 'INR'
    };

    console.log('Capturing payment:', paymentId, captureOptions);
    
    const capture = await razorpay.payments.capture(paymentId, amount, 'INR');
    
    console.log('Payment captured:', capture.id);
    return capture;
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw new Error(`Failed to capture payment: ${error.message}`);
  }
};

/**
 * Create a transfer to seller account
 * @param {Object} transferData - Transfer details
 * @param {string} transferData.account - Seller's Razorpay account ID
 * @param {number} transferData.amount - Amount in paise
 * @param {string} transferData.currency - Currency code
 * @param {string} transferData.notes - Transfer notes
 * @returns {Promise<Object>} Transfer response
 */
const createTransfer = async (transferData) => {
  try {
    const {
      account,
      amount,
      currency = 'INR',
      notes = {}
    } = transferData;

    const transferOptions = {
      account,
      amount: Math.round(amount),
      currency,
      notes
    };

    console.log('Creating transfer with options:', transferOptions);
    
    const transfer = await razorpay.transfers.create(transferOptions);
    
    console.log('Transfer created:', transfer.id);
    return transfer;
  } catch (error) {
    console.error('Error creating transfer:', error);
    throw new Error(`Failed to create transfer: ${error.message}`);
  }
};

/**
 * Create a refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Refund amount in paise (optional, defaults to full amount)
 * @param {string} notes - Refund notes
 * @returns {Promise<Object>} Refund response
 */
const createRefund = async (paymentId, amount = null, notes = '') => {
  try {
    const refundOptions = {
      notes: notes || 'Refund for order cancellation'
    };

    if (amount) {
      refundOptions.amount = Math.round(amount);
    }

    console.log('Creating refund with options:', refundOptions);
    
    const refund = await razorpay.payments.refund(paymentId, refundOptions);
    
    console.log('Refund created:', refund.id);
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error(`Failed to create refund: ${error.message}`);
  }
};

/**
 * Get payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
const getPayment = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw new Error(`Failed to fetch payment: ${error.message}`);
  }
};

/**
 * Get order details
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise<Object>} Order details
 */
const getOrder = async (orderId) => {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw new Error(`Failed to fetch order: ${error.message}`);
  }
};

/**
 * Verify webhook signature
 * @param {string} body - Webhook request body
 * @param {string} signature - Webhook signature
 * @returns {boolean} Signature verification result
 */
const verifyWebhookSignature = (body, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

/**
 * Create marketplace transfer during order creation
 * @param {Array} sellerSplits - Array of seller split details
 * @returns {Array} Transfers array for Razorpay order
 */
const createMarketplaceTransfers = (sellerSplits) => {
  // TODO: Enable marketplace features in Razorpay dashboard
  // TODO: Set up seller accounts with Razorpay Connect
  // TODO: Validate seller KYC status before creating transfers
  
  return sellerSplits.map(split => ({
    account: split.sellerAccountId, // Razorpay account ID of seller
    amount: Math.round(split.amount),
    currency: 'INR',
    notes: {
      seller_id: split.sellerId,
      seller_name: split.sellerName,
      order_id: split.orderId
    }
  }));
};

/**
 * Calculate platform fee
 * @param {number} amount - Order amount
 * @param {number} feePercentage - Platform fee percentage (default: 5%)
 * @returns {number} Platform fee amount
 */
const calculatePlatformFee = (amount, feePercentage = 5) => {
  return Math.round((amount * feePercentage) / 100);
};

/**
 * Calculate seller payout amount
 * @param {number} orderAmount - Order amount
 * @param {number} platformFeePercentage - Platform fee percentage
 * @param {number} processingFee - Fixed processing fee
 * @returns {number} Seller payout amount
 */
const calculateSellerPayout = (orderAmount, platformFeePercentage = 5, processingFee = 0) => {
  const platformFee = calculatePlatformFee(orderAmount, platformFeePercentage);
  return orderAmount - platformFee - processingFee;
};

module.exports = {
  createOrder,
  verifySignature,
  capturePayment,
  createTransfer,
  createRefund,
  getPayment,
  getOrder,
  verifyWebhookSignature,
  createMarketplaceTransfers,
  calculatePlatformFee,
  calculateSellerPayout
};
