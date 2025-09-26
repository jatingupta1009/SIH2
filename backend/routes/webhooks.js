const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Payout = require('../models/Payout');
const razorpayService = require('../services/razorpayService');

/**
 * Razorpay webhook endpoint
 * Handles payment events from Razorpay
 */
router.post('/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    if (!razorpayService.verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Received webhook event:', event.event);

    switch (event.event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(event.payload.payment.entity);
        break;

      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;

      case 'transfer.processed':
        await handleTransferProcessed(event.payload.transfer.entity);
        break;

      case 'transfer.failed':
        await handleTransferFailed(event.payload.transfer.entity);
        break;

      case 'refund.processed':
        await handleRefundProcessed(event.payload.refund.entity);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

/**
 * Handle payment authorized event
 */
async function handlePaymentAuthorized(payment) {
  try {
    const order = await Order.findOne({ 'razorpay.paymentId': payment.id });
    if (order) {
      order.razorpay.status = 'authorized';
      await order.save();
      console.log(`Payment authorized for order ${order.orderNumber}`);
    }
  } catch (error) {
    console.error('Error handling payment authorized:', error);
  }
}

/**
 * Handle payment captured event
 */
async function handlePaymentCaptured(payment) {
  try {
    const order = await Order.findOne({ 'razorpay.paymentId': payment.id });
    if (order) {
      order.razorpay.status = 'captured';
      order.razorpay.capturedAt = new Date();
      order.status = 'PAID';
      await order.save();
      
      console.log(`Payment captured for order ${order.orderNumber}`);
      
      // TODO: Send confirmation email to user
      // TODO: Send notification to sellers
      // TODO: Schedule payout processing
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(payment) {
  try {
    const order = await Order.findOne({ 'razorpay.paymentId': payment.id });
    if (order) {
      order.razorpay.status = 'failed';
      order.status = 'CANCELLED';
      await order.save();
      
      console.log(`Payment failed for order ${order.orderNumber}`);
      
      // TODO: Send failure notification to user
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

/**
 * Handle order paid event
 */
async function handleOrderPaid(order) {
  try {
    const dbOrder = await Order.findOne({ 'razorpay.orderId': order.id });
    if (dbOrder) {
      dbOrder.status = 'PAID';
      await dbOrder.save();
      
      console.log(`Order ${dbOrder.orderNumber} marked as paid`);
    }
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}

/**
 * Handle transfer processed event
 */
async function handleTransferProcessed(transfer) {
  try {
    const payout = await Payout.findOne({ razorpayTransferId: transfer.id });
    if (payout) {
      payout.status = 'completed';
      payout.completedAt = new Date();
      await payout.save();
      
      console.log(`Payout ${payout._id} completed`);
      
      // TODO: Send payout notification to seller
    }
  } catch (error) {
    console.error('Error handling transfer processed:', error);
  }
}

/**
 * Handle transfer failed event
 */
async function handleTransferFailed(transfer) {
  try {
    const payout = await Payout.findOne({ razorpayTransferId: transfer.id });
    if (payout) {
      payout.status = 'failed';
      payout.failureReason = transfer.failure_reason || 'Transfer failed';
      await payout.save();
      
      console.log(`Payout ${payout._id} failed: ${payout.failureReason}`);
      
      // TODO: Notify admin about failed payout
      // TODO: Send notification to seller
    }
  } catch (error) {
    console.error('Error handling transfer failed:', error);
  }
}

/**
 * Handle refund processed event
 */
async function handleRefundProcessed(refund) {
  try {
    const order = await Order.findOne({ 'razorpay.paymentId': refund.payment_id });
    if (order) {
      order.razorpay.status = 'refunded';
      order.razorpay.refundedAt = new Date();
      order.razorpay.refundAmount = refund.amount / 100; // Convert from paise
      order.status = 'REFUNDED';
      await order.save();
      
      console.log(`Refund processed for order ${order.orderNumber}`);
      
      // TODO: Send refund notification to user
      // TODO: Reverse seller payouts if needed
    }
  } catch (error) {
    console.error('Error handling refund processed:', error);
  }
}

module.exports = router;
