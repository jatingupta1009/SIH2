const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: ['photography', 'folk-art', 'craft-instruction', 'local-guide', 'cultural-experience', 'workshop', 'performance']
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Price per hour is required'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    min: {
      type: Number,
      required: true,
      min: 1
    },
    max: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      enum: ['hours', 'days'],
      default: 'hours'
    }
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  minParticipants: {
    type: Number,
    default: 1,
    min: 1
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  location: {
    type: {
      type: String,
      enum: ['fixed', 'mobile', 'online'],
      default: 'fixed'
    },
    address: String,
    city: String,
    state: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  requirements: {
    materials: [String],
    equipment: [String],
    skills: [String],
    ageRestriction: {
      min: Number,
      max: Number
    },
    physicalRequirements: String
  },
  inclusions: [String],
  exclusions: [String],
  cancellationPolicy: {
    freeCancellationHours: {
      type: Number,
      default: 24
    },
    cancellationFee: {
      type: Number,
      default: 0
    },
    refundPolicy: String
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    workingHours: {
      start: String,
      end: String
    },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    blackoutDates: [Date]
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  bookings: {
    total: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    cancelled: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
serviceSchema.index({ name: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ category: 1 });
serviceSchema.index({ artisan: 1 });
serviceSchema.index({ 'ratings.average': -1 });
serviceSchema.index({ pricePerHour: 1 });

// Virtual for artisan name
serviceSchema.virtual('artisanName').get(function() {
  return this.artisan?.name || 'Unknown Artisan';
});

// Virtual for artisan location
serviceSchema.virtual('artisanLocation').get(function() {
  return this.artisan?.location?.city || 'Unknown Location';
});

// Method to update average rating
serviceSchema.methods.updateRating = function() {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings.average = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.ratings.count = this.reviews.length;
  } else {
    this.ratings.average = 0;
    this.ratings.count = 0;
  }
};

// Pre-save middleware to update rating
serviceSchema.pre('save', function(next) {
  this.updateRating();
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
