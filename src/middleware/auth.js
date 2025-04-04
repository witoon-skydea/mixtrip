const passport = require('passport');
const jwt = require('jsonwebtoken');

// Protect API routes - JWT Auth
exports.protect = passport.authenticate('jwt', { session: false });

// Protect routes - Session Auth
exports.ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.redirect('/login');
};

// Redirect if authenticated
exports.ensureGuest = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  
  next();
};

// Admin only access
exports.ensureAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  if (req.headers.authorization) {
    // API request
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
  
  // Web request
  res.status(403).render('error/403');
};

// Generate JWT Token
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

// Trip owner or admin access
exports.tripOwnerOrAdmin = async (req, res, next) => {
  try {
    const Trip = require('../models/Trip');
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Check if user is trip owner or admin
    if (
      trip.user.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this trip'
      });
    }

    next();
  } catch (err) {
    console.error('Trip owner auth error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
