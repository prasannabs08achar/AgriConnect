// Market Price Service for fetching current agricultural commodity prices
// This service provides mock data for demonstration purposes
// In production, this would connect to a real agricultural commodity price API

const CROP_PRICES = {
  'wheat': { price: 2500, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'rice': { price: 3200, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'corn': { price: 1800, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'tomato': { price: 45, unit: 'per kg', lastUpdated: new Date().toISOString() },
  'potato': { price: 25, unit: 'per kg', lastUpdated: new Date().toISOString() },
  'onion': { price: 35, unit: 'per kg', lastUpdated: new Date().toISOString() },
  'carrot': { price: 40, unit: 'per kg', lastUpdated: new Date().toISOString() },
  'cabbage': { price: 20, unit: 'per kg', lastUpdated: new Date().toISOString() },
  'cauliflower': { price: 30, unit: 'per kg', lastUpdated: new Date().toISOString() },
  'spinach': { price: 15, unit: 'per kg', lastUpdated: new Date().toISOString() },
  'mango': { price: 80, unit: 'per kg', lastUpdated: new Date().toISOString() },
  'banana': { price: 35, unit: 'per kg', lastUpdated: new Date().toISOString() },
  'apple': { price: 120, unit: 'per kg', lastUpdated: new Date().toISOString() },
  'orange': { price: 60, unit: 'per kg', lastUpdated: new Date().toISOString() },
  'grapes': { price: 100, unit: 'per kg', lastUpdated: new Date().toISOString() },
  'pomegranate': { price: 150, unit: 'per kg', lastUpdated: new Date().toISOString() },
  'sugarcane': { price: 15, unit: 'per kg', lastUpdated: new Date().toISOString() },
  'cotton': { price: 6500, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'soybean': { price: 4200, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'mustard': { price: 4800, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'sunflower': { price: 5200, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'groundnut': { price: 6800, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'chickpea': { price: 5500, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'lentil': { price: 6200, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'black gram': { price: 7200, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'green gram': { price: 6800, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'pigeon pea': { price: 5800, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'kidney bean': { price: 8500, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'cowpea': { price: 7500, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'millet': { price: 3200, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'sorghum': { price: 2800, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'barley': { price: 1800, unit: 'per quintal', lastUpdated: new Date().toISOString() },
  'oats': { price: 2200, unit: 'per quintal', lastUpdated: new Date().toISOString() }
};

// Function to get market price for a specific crop
export const getMarketPrice = (cropName) => {
  if (!cropName) return null;
  
  // Normalize crop name for lookup
  const normalizedName = cropName.toLowerCase().trim();
  
  // Try exact match first
  if (CROP_PRICES[normalizedName]) {
    return CROP_PRICES[normalizedName];
  }
  
  // Try partial match for common variations
  const partialMatch = Object.keys(CROP_PRICES).find(key => 
    key.includes(normalizedName) || normalizedName.includes(key)
  );
  
  if (partialMatch) {
    return CROP_PRICES[partialMatch];
  }
  
  // Return default price if no match found
  return {
    price: 2000,
    unit: 'per unit',
    lastUpdated: new Date().toISOString(),
    note: 'Estimated price - exact match not found'
  };
};

// Function to get all market prices
export const getAllMarketPrices = () => {
  return CROP_PRICES;
};

// Function to search crops by name
export const searchCropPrices = (searchTerm) => {
  if (!searchTerm) return CROP_PRICES;
  
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  return Object.entries(CROP_PRICES)
    .filter(([key, value]) => 
      key.includes(normalizedSearch) || 
      value.unit.includes(normalizedSearch)
    )
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
};

// Function to get price comparison (crop price vs market price)
export const getPriceComparison = (cropName, cropPrice) => {
  const marketPrice = getMarketPrice(cropName);
  if (!marketPrice || !cropPrice) return null;
  
  const difference = cropPrice - marketPrice.price;
  const percentageDiff = ((difference / marketPrice.price) * 100).toFixed(1);
  
  return {
    cropPrice,
    marketPrice: marketPrice.price,
    difference,
    percentageDiff: parseFloat(percentageDiff),
    isAboveMarket: difference > 0,
    isBelowMarket: difference < 0,
    isAtMarket: Math.abs(difference) < (marketPrice.price * 0.05) // Within 5% is considered "at market"
  };
};

export default {
  getMarketPrice,
  getAllMarketPrices,
  searchCropPrices,
  getPriceComparison
};
