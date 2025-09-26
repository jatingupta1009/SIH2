const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  alt: String,
  isPrimary: {
    type: Boolean,
    default: false
  }
});

const attributeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
});

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  sku: String,
  attributes: [attributeSchema]
});

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 500
  },
  images: [imageSchema],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  mrp: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['handicrafts', 'textiles', 'experiences', 'food', 'home-decor', 'jewelry']
  },
  tags: [String],
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: true
  },
  attributes: [attributeSchema],
  variants: [variantSchema],
  
  // SEO fields
  metaTitle: String,
  metaDescription: String,
  
  // Rating and reviews
  ratingAvg: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  
  // Product status
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'active'
  },
  
  // Shipping info
  weight: Number, // in grams
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  
  // Delivery estimates
  deliveryTime: {
    min: { type: Number, default: 3 }, // days
    max: { type: Number, default: 7 }  // days
  },
  
  // SEO and analytics
  viewCount: {
    type: Number,
    default: 0
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

// Indexes for better performance
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ sellerId: 1, status: 1 });
ProductSchema.index({ slug: 1 });

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.mrp && this.mrp > this.price) {
    return Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  return 0;
});

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= 5) return 'low_stock';
  return 'in_stock';
});

// Method to reduce stock
ProductSchema.methods.reduceStock = function(quantity) {
  if (this.stock >= quantity) {
    this.stock -= quantity;
    return this.save();
  }
  throw new Error('Insufficient stock');
};

// Method to increase stock
ProductSchema.methods.increaseStock = function(quantity) {
  this.stock += quantity;
  return this.save();
};

// Static method to get featured products
ProductSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ 
    status: 'active',
    ratingAvg: { $gte: 4.0 }
  })
  .populate('sellerId', 'name profileImage rating')
  .sort({ ratingAvg: -1, ratingCount: -1 })
  .limit(limit);
};

// Static method to get products by category
ProductSchema.statics.getByCategory = function(category, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ 
    category, 
    status: 'active' 
  })
  .populate('sellerId', 'name profileImage rating')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Update timestamp on save
ProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);