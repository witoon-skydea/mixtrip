const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect, tripOwnerOrAdmin } = require('../middleware/auth');
const tripController = require('../controllers/tripController');
const commentController = require('../controllers/commentController');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
router.get('/', tripController.getTrips);

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Public/Private (based on trip privacy)
router.get('/:id', tripController.getTrip);

// @desc    Create a trip
// @route   POST /api/trips
// @access  Private
router.post(
  '/',
  [
    protect,
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('startDate', 'Start date is required').not().isEmpty(),
    check('endDate', 'End date is required').not().isEmpty(),
    check('location.country', 'Country is required').not().isEmpty()
  ],
  tripController.createTrip
);

// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Private
router.put(
  '/:id',
  [
    protect,
    tripOwnerOrAdmin,
    check('title', 'Title is required').optional().not().isEmpty(),
    check('description', 'Description is required').optional().not().isEmpty()
  ],
  tripController.updateTrip
);

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
router.delete('/:id', protect, tripOwnerOrAdmin, tripController.deleteTrip);

// @desc    Fork/remix a trip
// @route   POST /api/trips/:id/fork
// @access  Private
router.post('/:id/fork', protect, tripController.forkTrip);

// @desc    Like a trip
// @route   PUT /api/trips/:id/like
// @access  Private
router.put('/:id/like', protect, tripController.likeTrip);

// @desc    Unlike a trip
// @route   PUT /api/trips/:id/unlike
// @access  Private
router.put('/:id/unlike', protect, tripController.unlikeTrip);

// Comment routes
// @desc    Get comments for a trip
// @route   GET /api/trips/:id/comments
// @access  Public
router.get('/:id/comments', commentController.getComments);

// @desc    Add comment to a trip
// @route   POST /api/trips/:id/comments
// @access  Private
router.post(
  '/:id/comments',
  [
    protect,
    check('content', 'Comment content is required').not().isEmpty()
  ],
  commentController.addComment
);

module.exports = router;
