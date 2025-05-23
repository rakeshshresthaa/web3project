const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const Destination = require('../models/Destination');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Get all destinations with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('type').optional().isIn(['mountain', 'temple', 'city', 'national_park', 'lake', 'other']),
  query('region').optional().isString(),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('search').optional().isString(),
  validate
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      region,
      minRating,
      maxPrice,
      search
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (region) query.region = region;
    if (minRating) query.rating = { $gte: minRating };
    if (maxPrice) query['entryFee.foreign'] = { $lte: maxPrice };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const destinations = await Destination.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('reviews')
      .sort({ rating: -1 });

    const total = await Destination.countDocuments(query);

    res.json({
      success: true,
      data: destinations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching destinations',
      error: error.message
    });
  }
});

// Get single destination by ID
router.get('/:id', [
  param('id').isMongoId(),
  validate
], async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id)
      .populate('reviews')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'displayName photoURL'
        }
      });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.json({
      success: true,
      data: destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching destination',
      error: error.message
    });
  }
});

// Create new destination (admin only)
router.post('/', [
  auth,
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('location.coordinates').isArray().withMessage('Coordinates must be an array'),
  body('region').trim().notEmpty(),
  body('type').isIn(['mountain', 'temple', 'city', 'national_park', 'lake', 'other']),
  body('activities').optional().isArray(),
  body('bestTimeToVisit').optional().isArray(),
  body('entryFee').optional().isObject(),
  body('facilities').optional().isArray(),
  validate
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create destinations'
      });
    }

    const destination = new Destination(req.body);
    await destination.save();

    res.status(201).json({
      success: true,
      data: destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating destination',
      error: error.message
    });
  }
});

// Update destination (admin only)
router.put('/:id', [
  auth,
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('location.coordinates').optional().isArray(),
  body('region').optional().trim().notEmpty(),
  body('type').optional().isIn(['mountain', 'temple', 'city', 'national_park', 'lake', 'other']),
  body('activities').optional().isArray(),
  body('bestTimeToVisit').optional().isArray(),
  body('entryFee').optional().isObject(),
  body('facilities').optional().isArray(),
  validate
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update destinations'
      });
    }

    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.json({
      success: true,
      data: destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating destination',
      error: error.message
    });
  }
});

// Delete destination (admin only)
router.delete('/:id', [
  auth,
  param('id').isMongoId(),
  validate
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete destinations'
      });
    }

    const destination = await Destination.findByIdAndDelete(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.json({
      success: true,
      message: 'Destination deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting destination',
      error: error.message
    });
  }
});

module.exports = router; 