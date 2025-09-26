const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: true
  },
  bookingDetails: {
    date: {
      type: Date,
      required: [true, 'Booking date is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required']
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1
    },
    participants: {
      type: Number,
      required: [true, 'Number of participants is required'],
      min: 1
    },
    location: {
      type: String,
      required: [true, 'Location is required']
    },
    specialRequests: String
  },
  contactInfo: {
    name: {
      type: String,
      required: [true, 'Contact name is required']
    },
    email: {
      type: String,
      required: [true, 'Contact email is required']
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required']
    }
  },
  pricing: {
    hourlyRate: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    taxes: {
      type: Number,
      default: 0
    },
    fees: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'netbanking', 'wallet'],
      default: 'upi'
    },
    transactionId: String,
    paymentDate: Date,
    refundAmount: Number,
    refundDate: Date,
    refundReason: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  cancellation: {
    isCancelled: {
      type: Boolean,
      default: false
    },
    cancelledBy: {
      type: String,
      enum: ['user', 'artisan', 'admin', 'system']
    },
    cancellationReason: String,
    cancellationDate: Date,
    refundEligible: {
      type: Boolean,
      default: false
    },
    refundAmount: Number
  },
  communication: [{
    sender: {
      type: String,
      enum: ['user', 'artisan', 'admin']
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    attachments: [String]
  }],
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    images: [String],
    createdAt: Date
  },
  completion: {
    completedAt: Date,
    notes: String,
    deliverables: [String],
    photos: [String]
  },
  reminders: [{
    type: {
      type: String,
      enum: ['booking_confirmation', 'day_before', 'hour_before', 'completion']
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending']
    }
  }]
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ user: 1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ artisan: 1 });
bookingSchema.index({ 'bookingDetails.date': 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'payment.status': 1 });

// Virtual for booking reference
bookingSchema.virtual('bookingRef').get(function() {
  return `BK${this._id.toString().slice(-8).toUpperCase()}`;
});

// Method to calculate total
bookingSchema.methods.calculateTotal = function() {
  this.pricing.subtotal = this.pricing.hourlyRate * this.pricing.duration;
  this.pricing.total = this.pricing.subtotal + this.pricing.taxes + this.pricing.fees;
};

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const bookingDate = new Date(this.bookingDetails.date);
  const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);
  
  return hoursUntilBooking > this.service?.cancellationPolicy?.freeCancellationHours || 24;
};

// Method to calculate refund amount
bookingSchema.methods.calculateRefund = function() {
  if (!this.canBeCancelled()) {
    return this.pricing.total - (this.service?.cancellationPolicy?.cancellationFee || 0);
  }
  return this.pricing.total;
};

// Pre-save middleware to calculate total
bookingSchema.pre('save', function(next) {
  if (this.isModified('pricing.hourlyRate') || this.isModified('pricing.duration')) {
    this.calculateTotal();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
