const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Service = require('../models/Service');
const Artisan = require('../models/Artisan');
const { protect, authorize, optionalAuth, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all services with filtering and pagination
// @route   GET /api/services
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['photography', 'folk-art', 'craft-instruction', 'local-guide', 'cultural-experience', 'workshop', 'performance']),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('location').optional().trim(),
  query('search').optional().trim(),
  query('sort').optional().isIn(['newest', 'oldest', 'price-low', 'price-high', 'rating', 'popular']),
  query('featured').optional().isBoolean().withMessage('Featured must be a boolean')
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

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.pricePerHour = {};
      if (req.query.minPrice) filter.pricePerHour.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.pricePerHour.$lte = parseFloat(req.query.maxPrice);
    }

    if (req.query.location) {
      filter['location.city'] = { $regex: req.query.location, $options: 'i' };
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    if (req.query.featured !== undefined) {
      filter.isFeatured = req.query.featured === 'true';
    }

    // Build sort object
    let sort = {};
    switch (req.query.sort) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'price-low':
        sort = { pricePerHour: 1 };
        break;
      case 'price-high':
        sort = { pricePerHour: -1 };
        break;
      case 'rating':
        sort = { 'ratings.average': -1 };
        break;
      case 'popular':
        sort = { views: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Execute query
    const services = await Service.find(filter)
      .populate('artisan', 'specialty location')
      .populate('artisan.user', 'name profileImage')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments(filter);
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
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('artisan', 'specialty location contact')
      .populate('artisan.user', 'name profileImage phone')
      .populate('reviews.user', 'name profileImage');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (!service.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Service not available'
      });
    }

    // Increment view count
    service.views += 1;
    await service.save();

    res.json({
      success: true,
      data: { service }
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Artisan)
router.post('/', protect, authorize('artisan'), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Service name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['photography', 'folk-art', 'craft-instruction', 'local-guide', 'cultural-experience', 'workshop', 'performance']).withMessage('Invalid category'),
  body('pricePerHour').isFloat({ min: 0 }).withMessage('Price per hour must be a positive number'),
  body('duration.min').isInt({ min: 1 }).withMessage('Minimum duration must be at least 1'),
  body('duration.max').isInt({ min: 1 }).withMessage('Maximum duration must be at least 1'),
  body('maxParticipants').isInt({ min: 1 }).withMessage('Max participants must be at least 1'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
  body('images.*.url').isURL().withMessage('Invalid image URL'),
  body('location.type').isIn(['fixed', 'mobile', 'online']).withMessage('Invalid location type'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.state').trim().notEmpty().withMessage('State is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('requirements').optional().isObject(),
  body('inclusions').optional().isArray(),
  body('exclusions').optional().isArray()
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

    // Find artisan profile
    const artisan = await Artisan.findOne({ user: req.user._id });
    if (!artisan) {
      return res.status(400).json({
        success: false,
        message: 'Artisan profile not found. Please create your artisan profile first.'
      });
    }

    const serviceData = {
      ...req.body,
      artisan: artisan._id
    };

    const service = await Service.create(serviceData);

    // Populate artisan info
    await service.populate('artisan', 'specialty location');
    await service.populate('artisan.user', 'name profileImage');

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Owner/Admin)
router.put('/:id', protect, checkOwnership(Service), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Service name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').optional().isIn(['photography', 'folk-art', 'craft-instruction', 'local-guide', 'cultural-experience', 'workshop', 'performance']).withMessage('Invalid category'),
  body('pricePerHour').optional().isFloat({ min: 0 }).withMessage('Price per hour must be a positive number'),
  body('duration.min').optional().isInt({ min: 1 }).withMessage('Minimum duration must be at least 1'),
  body('duration.max').optional().isInt({ min: 1 }).withMessage('Maximum duration must be at least 1'),
  body('maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be at least 1'),
  body('images').optional().isArray({ min: 1 }).withMessage('At least one image is required'),
  body('images.*.url').optional().isURL().withMessage('Invalid image URL'),
  body('location.type').optional().isIn(['fixed', 'mobile', 'online']).withMessage('Invalid location type'),
  body('location.city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('location.state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('requirements').optional().isObject(),
  body('inclusions').optional().isArray(),
  body('exclusions').optional().isArray(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
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
      'name', 'description', 'category', 'pricePerHour', 'duration',
      'maxParticipants', 'minParticipants', 'images', 'location',
      'requirements', 'inclusions', 'exclusions', 'cancellationPolicy',
      'availability', 'tags', 'isActive', 'isFeatured'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('artisan', 'specialty location')
      .populate('artisan.user', 'name profileImage');

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service }
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Owner/Admin)
router.delete('/:id', protect, checkOwnership(Service), async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add service review
// @route   POST /api/services/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('bookingId').optional().isMongoId().withMessage('Invalid booking ID')
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

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user already reviewed this service
    const existingReview = service.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this service'
      });
    }

    const review = {
      user: req.user._id,
      booking: req.body.bookingId,
      rating: req.body.rating,
      comment: req.body.comment,
      images: req.body.images || []
    };

    service.reviews.push(review);
    await service.save();

    // Populate the new review
    await service.populate('reviews.user', 'name profileImage');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: { service }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get service categories
// @route   GET /api/services/categories/list
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
