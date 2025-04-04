const { validationResult } = require('express-validator');
const User = require('../models/User');
const Trip = require('../models/Trip');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res) => {
  try {
    const { search, limit = 10, page = 1 } = req.query;
    
    let query = {};
    
    // Search by name or email
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
      
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      data: users
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
      
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Get user error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get user's trips
// @route   GET /api/users/:id/trips
// @access  Public
exports.getUserTrips = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Find public trips or if user is the owner, all trips
    let query = { user: req.params.id };
    
    if (!req.user || req.user.id !== req.params.id) {
      query.isPublic = true;
    }
    
    const trips = await Trip.find(query)
      .populate('user', 'name avatar')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
      
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
    console.error('Get user trips error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Follow a user
// @route   PUT /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot follow yourself'
      });
    }
    
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const currentUser = await User.findById(req.user.id);
    
    // Check if already following
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'You are already following this user'
      });
    }
    
    // Add to following
    await User.findByIdAndUpdate(req.user.id, {
      $push: { following: req.params.id }
    });
    
    // Add to followers
    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user.id }
    });
    
    res.status(200).json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (err) {
    console.error('Follow user error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Unfollow a user
// @route   PUT /api/users/:id/unfollow
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot unfollow yourself'
      });
    }
    
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const currentUser = await User.findById(req.user.id);
    
    // Check if following
    if (!currentUser.following.includes(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'You are not following this user'
      });
    }
    
    // Remove from following
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { following: req.params.id }
    });
    
    // Remove from followers
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user.id }
    });
    
    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (err) {
    console.error('Unfollow user error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Web routes
exports.getUserProfilePage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render('error/404');
    }
    
    const trips = await Trip.find({ 
      user: req.params.id,
      isPublic: true
    })
      .sort({ createdAt: -1 })
      .limit(10);
      
    res.render('users/profile', {
      user,
      trips,
      isOwnProfile: req.user && req.user.id === req.params.id
    });
  } catch (err) {
    console.error('Get user profile page error:', err);
    res.status(500).render('error/500');
  }
};
