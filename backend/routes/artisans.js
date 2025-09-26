const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Artisan = require('../models/Artisan');
const User = require('../models/User');
const Product = require('../models/Product');
const Service = require('../models/Service');
const { protect, authorize, optionalAuth, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all artisans with filtering and pagination
// @route   GET /api/artisans
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('specialty').optional().trim(),
  query('location').optional().trim(),
  query('search').optional().trim(),
  query('sort').optional().isIn(['newest', 'oldest', 'rating', 'popular']),
  query('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
  query('verified').optional().isBoolean().withMessage('Verified must be a boolean')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };

    if (req.query.specialty) {
      filter.specialty = { $regex: req.query.specialty, $options: 'i' };
    }

    if (req.query.location) {
      filter['location.city'] = { $regex: req.query.location, $options: 'i' };
    }

    if (req.query.search) {
      filter.$or = [
        { specialty: { $regex: req.query.search, $options: 'i' } },
        { bio: { $regex: req.query.search, $options: 'i' } },
        { 'location.city': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.featured !== undefined) {
      filter.isFeatured = req.query.featured === 'true';
    }

    if (req.query.verified !== undefined) {
      filter.isVerified = req.query.verified === 'true';
    }

    // Build sort object
    let sort = {};
    switch (req.query.sort) {
      case 'newest':
        sort = { joinedDate: -1 };
        break;
      case 'oldest':
        sort = { joinedDate: 1 };
        break;
      case 'rating':
        sort = { 'ratings.average': -1 };
        break;
      case 'popular':
        sort = { profileViews: -1 };
        break;
      default:
        sort = { 'ratings.average': -1, joinedDate: -1 };
    }

    // Execute query
    const artisans = await Artisan.find(filter)
      .populate('user', 'name email profileImage phone')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Artisan.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        artisans,
        pagination: {
          currentPage: page,
          totalPages,
          totalArtisans: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get artisans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get featured artisans
// @route   GET /api/artisans/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const artisans = await Artisan.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('user', 'name email profileImage phone')
      .sort({ 'ratings.average': -1 })
      .limit(6);

    res.json({
      success: true,
      data: { artisans }
    });
  } catch (error) {
    console.error('Get featured artisans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single artisan
// @route   GET /api/artisans/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id)
      .populate('user', 'name email profileImage phone')
      .populate('products', 'name price images ratings')
      .populate('services', 'name description pricePerHour images ratings')
      .populate('reviews.user', 'name profileImage');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    if (!artisan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not available'
      });
    }

    // Increment profile views
    artisan.profileViews += 1;
    await artisan.save();

    res.json({
      success: true,
      data: { artisan }
    });
  } catch (error) {
    console.error('Get artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create artisan profile
// @route   POST /api/artisans
// @access  Private (Artisan)
router.post('/', protect, authorize('artisan'), [
  body('bio').trim().isLength({ min: 10, max: 500 }).withMessage('Bio must be between 10 and 500 characters'),
  body('specialty').trim().notEmpty().withMessage('Specialty is required'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('experience.years').optional().isInt({ min: 0 }).withMessage('Experience years must be a non-negative integer'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.state').trim().notEmpty().withMessage('State is required'),
  body('contact.phone').optional().matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
  body('contact.email').optional().isEmail().withMessage('Invalid email'),
  body('businessInfo.businessName').optional().trim(),
  body('businessInfo.businessType').optional().isIn(['individual', 'collective', 'cooperative', 'ngo']).withMessage('Invalid business type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if artisan profile already exists
    const existingArtisan = await Artisan.findOne({ user: req.user._id });
    if (existingArtisan) {
      return res.status(400).json({
        success: false,
        message: 'Artisan profile already exists'
      });
    }

    const artisanData = {
      ...req.body,
      user: req.user._id
    };

    const artisan = await Artisan.create(artisanData);
    await artisan.populate('user', 'name email profileImage phone');

    res.status(201).json({
      success: true,
      message: 'Artisan profile created successfully',
      data: { artisan }
    });
  } catch (error) {
    console.error('Create artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update artisan profile
// @route   PUT /api/artisans/:id
// @access  Private (Owner/Admin)
router.put('/:id', protect, checkOwnership(Artisan), [
  body('bio').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Bio must be between 10 and 500 characters'),
  body('specialty').optional().trim().notEmpty().withMessage('Specialty cannot be empty'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('experience.years').optional().isInt({ min: 0 }).withMessage('Experience years must be a non-negative integer'),
  body('location.city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('location.state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('contact.phone').optional().matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
  body('contact.email').optional().isEmail().withMessage('Invalid email'),
  body('businessInfo.businessName').optional().trim(),
  body('businessInfo.businessType').optional().isIn(['individual', 'collective', 'cooperative', 'ngo']).withMessage('Invalid business type'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = [
      'bio', 'specialty', 'skills', 'experience', 'portfolio', 'location',
      'contact', 'businessInfo', 'achievements', 'certifications',
      'availability', 'isVerified', 'isFeatured', 'isActive'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const artisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'name email profileImage phone');

    res.json({
      success: true,
      message: 'Artisan profile updated successfully',
      data: { artisan }
    });
  } catch (error) {
    console.error('Update artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete artisan profile
// @route   DELETE /api/artisans/:id
// @access  Private (Owner/Admin)
router.delete('/:id', protect, checkOwnership(Artisan), async (req, res) => {
  try {
    const artisan = await Artisan.findByIdAndDelete(req.params.id);

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    res.json({
      success: true,
      message: 'Artisan profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add artisan review
// @route   POST /api/artisans/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const artisan = await Artisan.findById(req.params.id);
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Check if user already reviewed this artisan
    const existingReview = artisan.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this artisan'
      });
    }

    const review = {
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment
    };

    artisan.reviews.push(review);
    await artisan.save();

    // Populate the new review
    await artisan.populate('reviews.user', 'name profileImage');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: { artisan }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get artisan's products
// @route   GET /api/artisans/:id/products
// @access  Public
router.get('/:id/products', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const artisan = await Artisan.findById(req.params.id);
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    const products = await Product.find({ 
      seller: artisan.user,
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ 
      seller: artisan.user,
      isActive: true 
    });
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get artisan products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get artisan's services
// @route   GET /api/artisans/:id/services
// @access  Public
router.get('/:id/services', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const artisan = await Artisan.findById(req.params.id);
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    const services = await Service.find({ 
      artisan: artisan._id,
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments({ 
      artisan: artisan._id,
      isActive: true 
    });
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          currentPage: page,
          totalPages,
          totalServices: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get artisan services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
