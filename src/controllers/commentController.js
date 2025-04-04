const { validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Trip = require('../models/Trip');

// @desc    Add comment to a trip
// @route   POST /api/trips/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { content, parent } = req.body;
    
    // Check if trip exists
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    // Check if parent comment exists
    if (parent) {
      const parentComment = await Comment.findById(parent);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          error: 'Parent comment not found'
        });
      }
      
      // Check if parent comment belongs to the same trip
      if (parentComment.trip.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          error: 'Parent comment does not belong to this trip'
        });
      }
    }
    
    // Create comment
    const comment = await Comment.create({
      content,
      trip: req.params.id,
      user: req.user.id,
      parent: parent || null
    });
    
    // Populate user details
    await comment.populate('user', 'name avatar');
    
    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (err) {
    console.error('Add comment error:', err);
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

// @desc    Get comments for a trip
// @route   GET /api/trips/:id/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const { parent, limit = 10, page = 1 } = req.query;
    
    // Check if trip exists
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    // Build query
    let query = { trip: req.params.id };
    
    if (parent === 'null' || parent === '') {
      query.parent = null;
    } else if (parent) {
      query.parent = parent;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const comments = await Comment.find(query)
      .populate('user', 'name avatar')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
      
    const total = await Comment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: comments.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      data: comments
    });
  } catch (err) {
    console.error('Get comments error:', err);
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

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { content } = req.body;
    
    // Find comment
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    // Check if user owns the comment
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this comment'
      });
    }
    
    // Update comment
    comment.content = content;
    await comment.save();
    
    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (err) {
    console.error('Update comment error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    // Find comment
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    // Check if user owns the comment
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment'
      });
    }
    
    // Delete all child comments
    await Comment.deleteMany({ parent: req.params.id });
    
    // Delete comment
    await comment.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Delete comment error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Like a comment
// @route   PUT /api/comments/:id/like
// @access  Private
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    // Check if comment has already been liked by user
    if (comment.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Comment already liked'
      });
    }
    
    comment.likes.unshift(req.user.id);
    await comment.save();
    
    res.status(200).json({
      success: true,
      data: comment.likes
    });
  } catch (err) {
    console.error('Like comment error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Unlike a comment
// @route   PUT /api/comments/:id/unlike
// @access  Private
exports.unlikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    // Check if comment has been liked by user
    if (!comment.likes.some(like => like.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Comment has not yet been liked'
      });
    }
    
    // Remove user from likes
    comment.likes = comment.likes.filter(like => like.toString() !== req.user.id);
    await comment.save();
    
    res.status(200).json({
      success: true,
      data: comment.likes
    });
  } catch (err) {
    console.error('Unlike comment error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
