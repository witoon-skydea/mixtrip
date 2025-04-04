const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect, ensureAuth, ensureGuest } = require('../middleware/auth');
const authController = require('../controllers/authController');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.register
);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, authController.getMe);

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
router.put(
  '/me',
  [
    protect,
    check('name', 'Name is required').not().isEmpty(),
    check('bio', 'Bio cannot be more than 500 characters').optional().isLength({ max: 500 }),
    check('location', 'Location cannot be more than 100 characters').optional().isLength({ max: 100 }),
    check('website', 'Website must be a valid URL').optional().isURL()
  ],
  authController.updateProfile
);

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
router.put(
  '/password',
  [
    protect,
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.updatePassword
);

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
router.get('/logout', protect, authController.logout);

// Web routes
router.get('/login', ensureGuest, authController.getLoginPage);
router.get('/register', ensureGuest, authController.getRegisterPage);
router.get('/profile', ensureAuth, authController.getProfilePage);

module.exports = router;
