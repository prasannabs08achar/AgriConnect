// Utility functions for handling location data

/**
 * Formats a location object or string for display
 * @param {Object|string} location - Location data (can be string or object with coordinates)
 * @returns {string} - Formatted location string
 */
export const formatLocation = (location) => {
  if (!location) {
    return 'Location not specified';
  }
  
  if (typeof location === 'string') {
    return location;
  }
  
  if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
    // Format as latitude, longitude (coordinates[1], coordinates[0])
    return `${location.coordinates[1]?.toFixed(4)}, ${location.coordinates[0]?.toFixed(4)}`;
  }
  
  return 'Location not specified';
};

/**
 * Converts location string to coordinates object for API calls
 * @param {string} locationString - Location string in format "lat, lng"
 * @returns {Object} - Location object with type and coordinates
 */
export const parseLocationString = (locationString) => {
  if (!locationString || typeof locationString !== 'string') {
    return {
      type: "Point",
      coordinates: [0, 0] // Default coordinates
    };
  }
  
  // Try to parse "lat, lng" format
  const parts = locationString.split(',').map(part => part.trim());
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      return {
        type: "Point",
        coordinates: [lng, lat] // MongoDB expects [longitude, latitude]
      };
    }
  }
  
  // Return default coordinates if parsing fails
  return {
    type: "Point",
    coordinates: [0, 0]
  };
};

export default {
  formatLocation,
  parseLocationString
};
