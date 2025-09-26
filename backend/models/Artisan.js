const mongoose = require('mongoose');

const bankDetailsSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true
  },
  ifscCode: {
    type: String,
    required: true
  },
  accountHolderName: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  branchName: String
});

const kycSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  documents: {
    pan: String,
    aadhar: String,
    bankStatement: String,
    gst: String
  },
  submittedAt: Date,
  verifiedAt: Date,
  rejectionReason: String
});

const ArtisanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  shopName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    required: true
  },
  
  // Business details
  businessType: {
    type: String,
    enum: ['individual', 'partnership', 'company'],
    default: 'individual'
  },
  gstNumber: String,
  panNumber: String,
  
  // Bank and payout details
  bankDetails: bankDetailsSchema,
  payoutAccountId: String, // Razorpay account ID for marketplace payouts
  
  // KYC status
  kyc: kycSchema,
  
  // Rating and performance
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  
  // Business metrics
  totalSales: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  productsCount: {
    type: Number,
    default: 0
  },
  servicesCount: {
    type: Number,
    default: 0
  },
  
  // Status and verification
  isFeatured: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  // Social links
  socialLinks: {
    website: String,
    instagram: String,
    facebook: String,
    youtube: String
  },
  
  // Working hours
  workingHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean }
  },
  
  // Payout settings
  payoutSettings: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    minimumAmount: {
      type: Number,
      default: 1000 // Minimum amount for payout
    },
    autoPayout: {
      type: Boolean,
      default: true
    }
  },
  
  joinedDate: {
    type: Date,
    default: Date.now
  },
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
ArtisanSchema.index({ location: 1, status: 1 });
ArtisanSchema.index({ specialty: 1, isFeatured: 1 });
ArtisanSchema.index({ rating: -1, reviewCount: -1 });

// Virtual for completion percentage
ArtisanSchema.virtual('profileCompletion').get(function() {
  let completed = 0;
  const total = 8;
  
  if (this.name) completed++;
  if (this.bio) completed++;
  if (this.profileImage) completed++;
  if (this.shopName) completed++;
  if (this.location) completed++;
  if (this.bankDetails.accountNumber) completed++;
  if (this.kyc.status === 'verified') completed++;
  if (this.socialLinks.website || this.socialLinks.instagram) completed++;
  
  return Math.round((completed / total) * 100);
});

// Method to update rating
ArtisanSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating * this.reviewCount) + newRating;
  this.reviewCount += 1;
  this.rating = totalRating / this.reviewCount;
  return this.save();
};

// Method to check if payout is eligible
ArtisanSchema.methods.isPayoutEligible = function(amount) {
  return this.kyc.status === 'verified' && 
         this.bankDetails.accountNumber && 
         amount >= this.payoutSettings.minimumAmount;
};

// Static method to get featured artisans
ArtisanSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ 
    isFeatured: true,
    status: 'active',
    kyc: { status: 'verified' }
  })
  .sort({ rating: -1, reviewCount: -1 })
  .limit(limit);
};

// Static method to get artisans by location
ArtisanSchema.statics.getByLocation = function(location, limit = 20) {
  return this.find({ 
    location: new RegExp(location, 'i'),
    status: 'active'
  })
  .sort({ rating: -1 })
  .limit(limit);
};

// Update timestamp on save
ArtisanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Artisan', ArtisanSchema);