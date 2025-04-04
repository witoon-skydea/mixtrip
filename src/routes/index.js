const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const tripController = require('../controllers/tripController');
const userController = require('../controllers/userController');

// @desc    Landing page
// @route   GET /
// @access  Public
router.get('/', (req, res) => {
  res.render('index');
});

// @desc    Dashboard
// @route   GET /dashboard
// @access  Private
router.get('/dashboard', ensureAuth, (req, res) => {
  res.render('dashboard');
});

// @desc    About page
// @route   GET /about
// @access  Public
router.get('/about', (req, res) => {
  res.render('about');
});

// @desc    Trips page
// @route   GET /trips
// @access  Public
router.get('/trips', tripController.getTripsPage);

// @desc    Single trip page
// @route   GET /trips/:id
// @access  Public/Private (based on trip privacy)
router.get('/trips/:id', tripController.getTripPage);

// @desc    Create trip page
// @route   GET /trips/new
// @access  Private
router.get('/trips/new', ensureAuth, tripController.getCreateTripPage);

// @desc    Edit trip page
// @route   GET /trips/:id/edit
// @access  Private
router.get('/trips/:id/edit', ensureAuth, tripController.getEditTripPage);

// @desc    User profile page
// @route   GET /users/:id
// @access  Public
router.get('/users/:id', userController.getUserProfilePage);

// @desc    Search page
// @route   GET /search
// @access  Public
router.get('/search', (req, res) => {
  res.render('search');
});

module.exports = router;
