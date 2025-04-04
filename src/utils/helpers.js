/**
 * Helper functions for the application
 */

/**
 * Format a date for display
 * @param {Date|string} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
exports.formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return dateObj.toLocaleDateString('en-US', formatOptions);
};

/**
 * Truncate text to a specified length
 * @param {string} str - The string to truncate
 * @param {number} len - The maximum length
 * @returns {string} Truncated string
 */
exports.truncateText = (str, len) => {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.substring(0, len) + '...';
};

/**
 * Strip HTML tags from a string
 * @param {string} str - The string to strip HTML from
 * @returns {string} String without HTML tags
 */
exports.stripTags = (str) => {
  if (!str) return '';
  return str.replace(/<(?:.|\n)*?>/gm, '');
};

/**
 * Create a slug from a string
 * @param {string} str - The string to slugify
 * @returns {string} Slugified string
 */
exports.slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

/**
 * Calculate how long ago a date was
 * @param {Date|string} date - The date to calculate from
 * @returns {string} Time ago string (e.g. "2 days ago")
 */
exports.timeAgo = (date) => {
  if (!date) return '';
  
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 31536000);
  
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  return seconds < 10 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
};

/**
 * Determine if a user is the owner of an item
 * @param {Object} user - The current user
 * @param {Object} item - The item to check
 * @returns {boolean} True if the user is the owner
 */
exports.isOwner = (user, item) => {
  if (!user || !item) return false;
  return user._id.toString() === item.user.toString() || user.role === 'admin';
};

/**
 * Generate a random string
 * @param {number} length - The length of the string to generate
 * @returns {string} Random string
 */
exports.generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Get the Google Maps API Key
 * @returns {string} Google Maps API Key
 */
exports.getGoogleMapsApiKey = () => {
  return process.env.GOOGLE_MAPS_API_KEY || '';
};

/**
 * Set pagination data for views
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination data
 */
exports.setPagination = (page = 1, limit = 10, total = 0) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

/**
 * Extracts coordinates from a Google Maps Place object
 * @param {Object} place - Google Maps Place object
 * @returns {Object|null} Coordinates object or null
 */
exports.extractCoordinates = (place) => {
  if (!place || !place.geometry || !place.geometry.location) return null;
  
  return {
    type: 'Point',
    coordinates: [
      place.geometry.location.lng(),
      place.geometry.location.lat()
    ]
  };
};
