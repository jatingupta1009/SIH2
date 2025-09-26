const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  variant: String,
  sku: String
});

const totalsSchema = new mongoose.Schema({
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  shipping: {
    type: Number,
    default: 0,
    min: 0
  },
  discounts: {
    type: Number,
    default: 0,
    min: 0
  },
  grandTotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const shippingAddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  landmark: String
});

const razorpaySchema = new mongoose.Schema({
  orderId: String, // Razorpay order ID
  paymentId: String, // Razorpay payment ID
  signature: String, // Payment signature
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    default: 'created'
  },
  amount: Number,
  currency: {
    type: String,
    default: 'INR'
  },
  method: String, // Payment method used
  capturedAt: Date,
  refundedAt: Date,
  refundAmount: {
    type: Number,
    default: 0
  }
});

const payoutSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  transferId: String, // Razorpay transfer ID
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed', 'reversed'],
    default: 'pending'
  },
  processedAt: Date,
  failureReason: String
});

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  
  // Order items
  items: [orderItemSchema],
  
  // Financial details
  totals: totalsSchema,
  
  // Shipping
  shippingAddress: shippingAddressSchema,
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight'],
    default: 'standard'
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  
  // Payment details
  razorpay: razorpaySchema,
  
  // Order status and tracking
  status: {
    type: String,
    enum: [
      'PENDING_PAYMENT',
      'PAID',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED'
    ],
    default: 'PENDING_PAYMENT'
  },
  
  // Tracking information
  trackingNumber: String,
  trackingUrl: String,
  
  // Coupons and discounts
  appliedCoupons: [{
    code: String,
    discount: Number,
    type: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  }],
  
  // Payouts to sellers
  payouts: [payoutSchema],
  
  // Order notes
  notes: String,
  adminNotes: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Status change history
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
});

// Indexes
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ 'razorpay.paymentId': 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'items.sellerId': 1 });

// Generate order number before saving
OrderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  
  this.updatedAt = new Date();
  next();
});

// Method to update status
OrderSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    note: note
  });
  return this.save();
};

// Method to calculate seller totals
OrderSchema.methods.getSellerTotals = function() {
  const sellerTotals = {};
  
  this.items.forEach(item => {
    const sellerId = item.sellerId.toString();
    if (!sellerTotals[sellerId]) {
      sellerTotals[sellerId] = {
        sellerId: item.sellerId,
        sellerName: item.sellerName,
        subtotal: 0,
        itemCount: 0
      };
    }
    
    sellerTotals[sellerId].subtotal += item.price * item.quantity;
    sellerTotals[sellerId].itemCount += item.quantity;
  });
  
  return Object.values(sellerTotals);
};

// Method to check if order can be cancelled
OrderSchema.methods.canBeCancelled = function() {
  return ['PENDING_PAYMENT', 'PAID', 'PROCESSING'].includes(this.status);
};

// Method to check if order can be refunded
OrderSchema.methods.canBeRefunded = function() {
  return ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(this.status) &&
         this.razorpay.status === 'captured';
};

// Static method to get orders by seller
OrderSchema.statics.getBySeller = function(sellerId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ 'items.sellerId': sellerId })
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get order statistics
OrderSchema.statics.getStats = function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totals.grandTotal' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', OrderSchema);
