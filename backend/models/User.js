const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
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
  landmark: String,
  isDefault: {
    type: Boolean,
    default: false
  }
});

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  variant: {
    type: String,
    default: null
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const UserSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  addresses: [addressSchema],
  cart: {
    type: cartSchema,
    default: () => ({ items: [], updatedAt: new Date() })
  },
  role: {
    type: String,
    enum: ['user', 'artisan', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
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

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update cart timestamp on modification
UserSchema.pre('save', function(next) {
  if (this.isModified('cart.items')) {
    this.cart.updatedAt = new Date();
  }
  this.updatedAt = new Date();
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get cart total
UserSchema.methods.getCartTotal = async function() {
  await this.populate('cart.items.productId');
  
  let total = 0;
  for (const item of this.cart.items) {
    if (item.productId) {
      total += item.productId.price * item.quantity;
    }
  }
  
  return total;
};

// Method to clear cart
UserSchema.methods.clearCart = function() {
  this.cart.items = [];
  this.cart.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);