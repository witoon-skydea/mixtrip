const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
router.get('/', userController.getUsers);

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', userController.getUser);

// @desc    Get user's trips
// @route   GET /api/users/:id/trips
// @access  Public
router.get('/:id/trips', userController.getUserTrips);

// @desc    Follow a user
// @route   PUT /api/users/:id/follow
// @access  Private
router.put('/:id/follow', protect, userController.followUser);

// @desc    Unfollow a user
// @route   PUT /api/users/:id/unfollow
// @access  Private
router.put('/:id/unfollow', protect, userController.unfollowUser);

module.exports = router;
