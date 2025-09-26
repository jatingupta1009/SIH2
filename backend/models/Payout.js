const mongoose = require('mongoose');

const PayoutSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  sellerEmail: {
    type: String,
    required: true
  },
  
  // Payout details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Razorpay details
  razorpayTransferId: String,
  razorpayAccountId: String, // Seller's Razorpay account ID
  
  // Bank details (for manual transfers)
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    bankName: String
  },
  
  // Payout status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Related orders
  orderIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  
  // Settlement period
  settlementPeriod: {
    startDate: Date,
    endDate: Date
  },
  
  // Processing details
  processedAt: Date,
  completedAt: Date,
  failureReason: String,
  
  // Fees and deductions
  platformFee: {
    type: Number,
    default: 0
  },
  processingFee: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  
  // Payout method
  method: {
    type: String,
    enum: ['razorpay_transfer', 'bank_transfer', 'manual'],
    default: 'razorpay_transfer'
  },
  
  // Reference and notes
  reference: String,
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
  }
});

// Indexes
PayoutSchema.index({ sellerId: 1, createdAt: -1 });
PayoutSchema.index({ status: 1, createdAt: -1 });
PayoutSchema.index({ razorpayTransferId: 1 });
PayoutSchema.index({ settlementPeriod: 1 });

// Virtual for payout summary
PayoutSchema.virtual('summary').get(function() {
  return {
    grossAmount: this.amount,
    deductions: this.platformFee + this.processingFee,
    netAmount: this.netAmount,
    status: this.status
  };
});

// Method to mark as processing
PayoutSchema.methods.markAsProcessing = function(transferId) {
  this.status = 'processing';
  this.razorpayTransferId = transferId;
  this.processedAt = new Date();
  return this.save();
};

// Method to mark as completed
PayoutSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to mark as failed
PayoutSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  return this.save();
};

// Static method to get pending payouts
PayoutSchema.statics.getPending = function() {
  return this.find({ status: 'pending' })
    .populate('sellerId', 'name email bankDetails')
    .sort({ createdAt: 1 });
};

// Static method to get payouts by seller
PayoutSchema.statics.getBySeller = function(sellerId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ sellerId })
    .populate('orderIds', 'orderNumber totals.grandTotal')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get payout statistics
PayoutSchema.statics.getStats = function(startDate, endDate) {
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
        totalAmount: { $sum: '$amount' },
        totalNetAmount: { $sum: '$netAmount' }
      }
    }
  ]);
};

// Update timestamp on save
PayoutSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Payout', PayoutSchema);
