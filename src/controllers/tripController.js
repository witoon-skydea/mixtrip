const { validationResult } = require('express-validator');
const Trip = require('../models/Trip');
const Comment = require('../models/Comment');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
exports.getTrips = async (req, res) => {
  try {
    const { 
      search, 
      location, 
      startDate, 
      endDate, 
      tags,
      limit = 10, 
      page = 1,
      sort = '-createdAt'
    } = req.query;
    
    // Build query
    let query = { isPublic: true };
    
    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by location
    if (location) {
      query['location.country'] = { $regex: location, $options: 'i' };
    }
    
    // Filter by date range
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    } else if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.endDate = { $lte: new Date(endDate) };
    }
    
    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const trips = await Trip.find(query)
      .populate('user', 'name avatar')
      .limit(parseInt(limit))
      .skip(skip)
      .sort(sort);
      
    const total = await Trip.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: trips.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      data: trips
    });
  } catch (err) {
    console.error('Get trips error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Public
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('forkedFrom', 'title user');
      
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    // Check if trip is private and not owned by current user
    if (!trip.isPublic && (!req.user || req.user.id !== trip.user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this trip'
      });
    }
    
    // Get comments for the trip
    const comments = await Comment.find({ trip: req.params.id, parent: null })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
      
    res.status(200).json({
      success: true,
      data: trip,
      comments
    });
  } catch (err) {
    console.error('Get trip error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create a trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      days,
      budget,
      isPublic,
      tags
    } = req.body;
    
    // Create new trip
    const trip = await Trip.create({
      title,
      description,
      startDate,
      endDate,
      location,
      days: days || [],
      budget: budget || { amount: 0, currency: 'USD' },
      isPublic: isPublic !== undefined ? isPublic : true,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      user: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (err) {
    console.error('Create trip error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Private
exports.updateTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      days,
      budget,
      isPublic,
      tags
    } = req.body;
    
    // Find trip
    let trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    // Check if user owns the trip
    if (trip.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this trip'
      });
    }
    
    // Build update object
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (location) updateData.location = location;
    if (days) updateData.days = days;
    if (budget) updateData.budget = budget;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
    
    // Update trip
    trip = await Trip.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (err) {
    console.error('Update trip error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
exports.deleteTrip = async (req, res) => {
  try {
    // Find trip
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    // Check if user owns the trip
    if (trip.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this trip'
      });
    }
    
    // Delete trip comments
    await Comment.deleteMany({ trip: req.params.id });
    
    // Delete trip
    await trip.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Delete trip error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Fork/remix a trip
// @route   POST /api/trips/:id/fork
// @access  Private
exports.forkTrip = async (req, res) => {
  try {
    // Find original trip
    const originalTrip = await Trip.findById(req.params.id);
    
    if (!originalTrip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    // Check if trip is public or owned by user
    if (!originalTrip.isPublic && originalTrip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to fork this trip'
      });
    }
    
    // Create fork/remix
    const newTrip = new Trip({
      title: `${originalTrip.title} (Remix)`,
      description: originalTrip.description,
      startDate: originalTrip.startDate,
      endDate: originalTrip.endDate,
      location: originalTrip.location,
      days: originalTrip.days,
      budget: originalTrip.budget,
      tags: originalTrip.tags,
      user: req.user.id,
      forkedFrom: originalTrip._id,
      isPublic: false // Default to private for forked trips
    });
    
    await newTrip.save();
    
    res.status(201).json({
      success: true,
      data: newTrip
    });
  } catch (err) {
    console.error('Fork trip error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Like a trip
// @route   PUT /api/trips/:id/like
// @access  Private
exports.likeTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    // Check if trip has already been liked by user
    if (trip.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Trip already liked'
      });
    }
    
    trip.likes.unshift(req.user.id);
    await trip.save();
    
    res.status(200).json({
      success: true,
      data: trip.likes
    });
  } catch (err) {
    console.error('Like trip error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Unlike a trip
// @route   PUT /api/trips/:id/unlike
// @access  Private
exports.unlikeTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    // Check if trip has been liked by user
    if (!trip.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Trip has not yet been liked'
      });
    }
    
    // Remove user from likes
    trip.likes = trip.likes.filter(like => like.toString() !== req.user.id);
    await trip.save();
    
    res.status(200).json({
      success: true,
      data: trip.likes
    });
  } catch (err) {
    console.error('Unlike trip error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Web routes
exports.getTripsPage = async (req, res) => {
  try {
    const trips = await Trip.find({ isPublic: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);
      
    res.render('trips/index', {
      trips
    });
  } catch (err) {
    console.error('Get trips page error:', err);
    res.status(500).render('error/500');
  }
};

exports.getTripPage = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('forkedFrom', 'title user');
      
    if (!trip) {
      return res.status(404).render('error/404');
    }
    
    // Check if trip is private and not owned by current user
    if (!trip.isPublic && (!req.user || req.user.id !== trip.user._id.toString())) {
      return res.status(403).render('error/403');
    }
    
    // Get comments for the trip
    const comments = await Comment.find({ trip: req.params.id, parent: null })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
      
    res.render('trips/show', {
      trip,
      comments,
      isOwner: req.user && req.user.id === trip.user._id.toString()
    });
  } catch (err) {
    console.error('Get trip page error:', err);
    res.status(500).render('error/500');
  }
};

exports.getCreateTripPage = (req, res) => {
  res.render('trips/new');
};

exports.getEditTripPage = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).render('error/404');
    }
    
    // Check if user owns the trip
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).render('error/403');
    }
    
    res.render('trips/edit', {
      trip
    });
  } catch (err) {
    console.error('Get edit trip page error:', err);
    res.status(500).render('error/500');
  }
};
