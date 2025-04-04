/**
 * MixTrip - Travel Route Planning Application
 * Main JavaScript file
 */

// DOM Elements
const navbarToggler = document.querySelector('.navbar-toggler');
const navbarMenu = document.querySelector('.navbar-menu');
const bannerClose = document.querySelector('.banner-close');
const promoBanner = document.querySelector('.promo-banner');
const navTabs = document.querySelectorAll('.nav-tab');
const tabPanes = document.querySelectorAll('.tab-pane');
const viewButtons = document.querySelectorAll('.view-btn');
const tripsContainer = document.querySelector('.trips-container');
const sortOptions = document.querySelectorAll('.sort-option');
const likeButtons = document.querySelectorAll('.like-btn');
const shareButton = document.querySelector('.share-btn');
const copyLinkButton = document.querySelector('.copy-link');
const confirmDeleteButtons = document.querySelectorAll('.confirm-delete');

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation toggle
  if (navbarToggler) {
    navbarToggler.addEventListener('click', function() {
      navbarMenu.classList.toggle('active');
      // Toggle hamburger icon animation
      this.classList.toggle('active');
    });
  }
  
  // Close promotional banner
  if (bannerClose && promoBanner) {
    bannerClose.addEventListener('click', function() {
      promoBanner.style.display = 'none';
      // Store banner state in localStorage to keep it closed
      localStorage.setItem('promoBanner', 'closed');
    });
    
    // Check if banner was previously closed
    if (localStorage.getItem('promoBanner') === 'closed') {
      promoBanner.style.display = 'none';
    }
  }
  
  // Tab navigation
  if (navTabs.length > 0 && tabPanes.length > 0) {
    navTabs.forEach(tab => {
      tab.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all tabs and panes
        navTabs.forEach(t => t.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding pane
        this.classList.add('active');
        const tabId = this.getAttribute('href') || this.querySelector('a').getAttribute('href');
        document.querySelector(tabId).classList.add('active');
      });
    });
  }
  
  // Toggle view (grid/list) for trips
  if (viewButtons.length > 0 && tripsContainer) {
    viewButtons.forEach(button => {
      button.addEventListener('click', function() {
        viewButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        if (this.classList.contains('grid-view')) {
          tripsContainer.classList.remove('list-view-container');
          tripsContainer.classList.add('grid-view-container');
        } else {
          tripsContainer.classList.remove('grid-view-container');
          tripsContainer.classList.add('list-view-container');
        }
      });
    });
  }
  
  // Sort options
  if (sortOptions.length > 0) {
    sortOptions.forEach(option => {
      option.addEventListener('click', function(e) {
        e.preventDefault();
        const sortBy = this.getAttribute('data-sort');
        console.log(`Sorting by: ${sortBy}`);
        // This would typically trigger an AJAX request to reload trips with the new sort
      });
    });
  }
  
  // Like/unlike trips or comments
  if (likeButtons.length > 0) {
    likeButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Toggle active class
        this.classList.toggle('active');
        
        // Update icon
        const icon = this.querySelector('i');
        if (this.classList.contains('active')) {
          icon.classList.remove('far');
          icon.classList.add('fas');
        } else {
          icon.classList.remove('fas');
          icon.classList.add('far');
        }
        
        // Send like/unlike request to server
        const type = this.classList.contains('like-btn') ? 'trip' : 'comment';
        const id = this.closest('[data-id]').getAttribute('data-id');
        const action = this.classList.contains('active') ? 'like' : 'unlike';
        
        // This would typically send an AJAX request to the server
        console.log(`${action} ${type} with ID: ${id}`);
      });
    });
  }
  
  // Share functionality
  if (shareButton) {
    const shareLinks = document.querySelectorAll('.share-link');
    
    shareLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const platform = this.getAttribute('data-platform');
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        
        let shareUrl;
        
        switch (platform) {
          case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
          case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
          case 'whatsapp':
            shareUrl = `https://wa.me/?text=${title}%20${url}`;
            break;
          case 'telegram':
            shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
            break;
          case 'email':
            shareUrl = `mailto:?subject=${title}&body=Check%20out%20this%20trip:%20${url}`;
            break;
          default:
            return;
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
      });
    });
    
    // Copy link functionality
    if (copyLinkButton) {
      copyLinkButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Create a temporary input element
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        
        // Select and copy the URL
        input.select();
        document.execCommand('copy');
        
        // Remove the temporary input
        document.body.removeChild(input);
        
        // Show a success message
        alert('Link copied to clipboard!');
      });
    }
  }
  
  // Confirm delete actions
  if (confirmDeleteButtons.length > 0) {
    confirmDeleteButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        if (!confirm('Are you sure you want to delete this? This action cannot be undone.')) {
          e.preventDefault();
        }
      });
    });
  }
  
  // Character counter for textareas
  const textareas = document.querySelectorAll('textarea[maxlength]');
  if (textareas.length > 0) {
    textareas.forEach(textarea => {
      const counter = textarea.nextElementSibling;
      if (counter && counter.classList.contains('char-counter')) {
        textarea.addEventListener('input', function() {
          const remaining = parseInt(textarea.getAttribute('maxlength')) - textarea.value.length;
          counter.textContent = `${remaining} characters remaining`;
          
          if (remaining < 20) {
            counter.classList.add('error');
          } else {
            counter.classList.remove('error');
          }
        });
      }
    });
  }
  
  // Initialize date validation for trip forms
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  
  if (startDateInput && endDateInput) {
    startDateInput.addEventListener('change', function() {
      endDateInput.min = startDateInput.value;
      if (endDateInput.value && new Date(endDateInput.value) < new Date(startDateInput.value)) {
        endDateInput.value = startDateInput.value;
      }
    });
  }
  
  // Popular tags click handler
  const tagSuggestions = document.querySelectorAll('.tag-suggestion');
  const tagsInput = document.getElementById('tags');
  
  if (tagSuggestions.length > 0 && tagsInput) {
    tagSuggestions.forEach(tag => {
      tag.addEventListener('click', function() {
        const tagName = this.getAttribute('data-tag');
        const currentTags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        if (!currentTags.includes(tagName)) {
          if (currentTags.length > 0) {
            tagsInput.value = `${tagsInput.value}, ${tagName}`;
          } else {
            tagsInput.value = tagName;
          }
        }
      });
    });
  }
  
  // Initialize Google Maps if available
  if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
    // Map for trip details page
    const tripMap = document.getElementById('tripMap');
    if (tripMap) {
      initTripMap();
    }
    
    // Map for trip form page
    const tripFormMap = document.getElementById('tripFormMap');
    if (tripFormMap) {
      initTripFormMap();
    }
    
    // Places autocomplete for activity location
    const activityLocation = document.getElementById('activityLocation');
    if (activityLocation) {
      const autocomplete = new google.maps.places.Autocomplete(activityLocation);
      autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          document.getElementById('activityLat').value = place.geometry.location.lat();
          document.getElementById('activityLng').value = place.geometry.location.lng();
        }
      });
    }
  }
});

/**
 * Initialize the trip map on the trip details page
 */
function initTripMap() {
  if (typeof google === 'undefined' || !document.getElementById('tripMap')) return;
  
  const mapOptions = {
    zoom: 10,
    center: { lat: 0, lng: 0 },
    mapTypeControl: true,
    fullscreenControl: true,
    streetViewControl: false,
    styles: [
      // Custom map styles would go here
    ]
  };
  
  const map = new google.maps.Map(document.getElementById('tripMap'), mapOptions);
  
  // This function would typically load markers dynamically from trip data
  // For demonstration, we'll create a sample marker
  const sampleLocation = { lat: 35.6895, lng: 139.6917 }; // Tokyo
  map.setCenter(sampleLocation);
  
  new google.maps.Marker({
    position: sampleLocation,
    map: map,
    title: 'Tokyo'
  });
}

/**
 * Initialize the map on the trip form page
 */
function initTripFormMap() {
  if (typeof google === 'undefined' || !document.getElementById('tripFormMap')) return;
  
  const mapOptions = {
    zoom: 2,
    center: { lat: 20, lng: 0 },
    mapTypeControl: true,
    fullscreenControl: true,
    streetViewControl: false
  };
  
  const map = new google.maps.Map(document.getElementById('tripFormMap'), mapOptions);
  
  // This would typically be enhanced to show markers for all activities with coordinates
}

/**
 * Format a date for display
 * @param {Date|string} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
function formatDate(date, options = {}) {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return dateObj.toLocaleDateString('en-US', formatOptions);
}
