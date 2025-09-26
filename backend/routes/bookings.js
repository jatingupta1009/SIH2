const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Artisan = require('../models/Artisan');
const User = require('../models/User');
const { protect, authorize, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all bookings for a user
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']),
  query('sort').optional().isIn(['newest', 'oldest', 'date'])
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { user: req.user._id };

    if (req.query.status) {
      filter.status = req.query.status;
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
      case 'date':
        sort = { 'bookingDetails.date': 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Execute query
    const bookings = await Booking.find(filter)
      .populate('service', 'name description pricePerHour images')
      .populate('artisan', 'specialty location')
      .populate('artisan.user', 'name profileImage phone')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: page,
          totalPages,
          totalBookings: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private (Owner/Admin)
router.get('/:id', protect, checkOwnership(Booking), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('service', 'name description pricePerHour images cancellationPolicy')
      .populate('artisan', 'specialty location contact')
      .populate('artisan.user', 'name profileImage phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, [
  body('serviceId').isMongoId().withMessage('Valid service ID is required'),
  body('bookingDetails.date').isISO8601().withMessage('Valid booking date is required'),
  body('bookingDetails.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('bookingDetails.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  body('bookingDetails.duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 hour'),
  body('bookingDetails.participants').isInt({ min: 1 }).withMessage('Participants must be at least 1'),
  body('bookingDetails.location').trim().notEmpty().withMessage('Location is required'),
  body('contactInfo.name').trim().isLength({ min: 2 }).withMessage('Contact name is required'),
  body('contactInfo.email').isEmail().withMessage('Valid email is required'),
  body('contactInfo.phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number is required'),
  body('bookingDetails.specialRequests').optional().trim()
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

    const { serviceId, bookingDetails, contactInfo } = req.body;

    // Get service details
    const service = await Service.findById(serviceId)
      .populate('artisan', 'user');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (!service.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Service is not available'
      });
    }

    // Check if booking date is in the future
    const bookingDate = new Date(bookingDetails.date);
    const now = new Date();
    if (bookingDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Booking date must be in the future'
      });
    }

    // Check participant limit
    if (bookingDetails.participants > service.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${service.maxParticipants} participants allowed`
      });
    }

    // Check duration limits
    if (bookingDetails.duration < service.duration.min || bookingDetails.duration > service.duration.max) {
      return res.status(400).json({
        success: false,
        message: `Duration must be between ${service.duration.min} and ${service.duration.max} ${service.duration.unit}`
      });
    }

    // Calculate pricing
    const subtotal = service.pricePerHour * bookingDetails.duration;
    const taxes = Math.round(subtotal * 0.18); // 18% GST
    const platformFee = Math.round(subtotal * 0.05); // 5% platform fee
    const total = subtotal + taxes + platformFee;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      service: serviceId,
      artisan: service.artisan._id,
      bookingDetails: {
        ...bookingDetails,
        date: bookingDate
      },
      contactInfo,
      pricing: {
        hourlyRate: service.pricePerHour,
        duration: bookingDetails.duration,
        subtotal,
        taxes,
        fees: platformFee,
        total
      }
    });

    // Update service booking count
    service.bookings.total += 1;
    await service.save();

    // Populate booking data
    await booking.populate('service', 'name description pricePerHour images');
    await booking.populate('artisan', 'specialty location');
    await booking.populate('artisan.user', 'name profileImage phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner/Admin)
router.put('/:id/status', protect, checkOwnership(Booking), [
  body('status').isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status'),
  body('notes').optional().trim()
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

    const { status, notes } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update status
    booking.status = status;

    // Add communication log
    booking.communication.push({
      sender: req.user.role === 'admin' ? 'admin' : 'user',
      message: `Status updated to ${status}${notes ? ': ' + notes : ''}`,
      timestamp: new Date()
    });

    // Handle completion
    if (status === 'completed') {
      booking.completion.completedAt = new Date();
      booking.completion.notes = notes;
    }

    await booking.save();

    // Populate updated booking
    await booking.populate('service', 'name description');
    await booking.populate('artisan', 'specialty');
    await booking.populate('artisan.user', 'name profileImage');

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Owner/Admin)
router.put('/:id/cancel', protect, checkOwnership(Booking), [
  body('reason').trim().notEmpty().withMessage('Cancellation reason is required')
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

    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('service', 'cancellationPolicy');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Check cancellation policy
    const canCancel = booking.canBeCancelled();
    const refundAmount = booking.calculateRefund();

    // Update booking
    booking.status = 'cancelled';
    booking.cancellation.isCancelled = true;
    booking.cancellation.cancelledBy = req.user.role === 'admin' ? 'admin' : 'user';
    booking.cancellation.cancellationReason = reason;
    booking.cancellation.cancellationDate = new Date();
    booking.cancellation.refundEligible = canCancel;
    booking.cancellation.refundAmount = refundAmount;

    // Add communication log
    booking.communication.push({
      sender: req.user.role === 'admin' ? 'admin' : 'user',
      message: `Booking cancelled: ${reason}`,
      timestamp: new Date()
    });

    await booking.save();

    // Update service booking count
    const service = await Service.findById(booking.service);
    if (service) {
      service.bookings.cancelled += 1;
      await service.save();
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { 
        booking,
        refundEligible: canCancel,
        refundAmount
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add booking review
// @route   POST /api/bookings/:id/review
// @access  Private (Owner)
router.post('/:id/review', protect, checkOwnership(Booking), [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  body('images').optional().isArray().withMessage('Images must be an array')
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

    const { rating, comment, images } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    if (booking.review.rating) {
      return res.status(400).json({
        success: false,
        message: 'Booking already reviewed'
      });
    }

    // Add review to booking
    booking.review = {
      rating,
      comment,
      images: images || [],
      createdAt: new Date()
    };

    await booking.save();

    // Add review to service
    const service = await Service.findById(booking.service);
    if (service) {
      service.reviews.push({
        user: req.user._id,
        booking: booking._id,
        rating,
        comment,
        images: images || []
      });
      await service.save();
    }

    res.json({
      success: true,
      message: 'Review added successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Add booking review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get artisan's bookings
// @route   GET /api/bookings/artisan/:artisanId
// @access  Private (Artisan/Admin)
router.get('/artisan/:artisanId', protect, authorize('artisan', 'admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if user owns this artisan profile
    const artisan = await Artisan.findById(req.params.artisanId);
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    if (req.user.role !== 'admin' && artisan.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Build filter
    const filter = { artisan: req.params.artisanId };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('service', 'name description pricePerHour')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: page,
          totalPages,
          totalBookings: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get artisan bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
