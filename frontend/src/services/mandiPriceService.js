// Mandi Price Service for fetching real-time agricultural commodity prices
// This service provides mock data for demonstration purposes
// In production, this would connect to real Mandi APIs like e-NAM, Agmarknet, etc.

const MANDI_PRICES = {
  'wheat': {
    name: 'Wheat',
    category: 'Cereals',
    currentPrice: 2450,
    previousPrice: 2400,
    unit: 'per quintal',
    mandi: 'Delhi',
    state: 'Delhi',
    lastUpdated: new Date().toISOString(),
    priceChange: 50,
    priceChangePercent: 2.08,
    minPrice: 2300,
    maxPrice: 2600,
    avgPrice: 2450
  },
  'rice': {
    name: 'Rice',
    category: 'Cereals',
    currentPrice: 3200,
    previousPrice: 3150,
    unit: 'per quintal',
    mandi: 'Mumbai',
    state: 'Maharashtra',
    lastUpdated: new Date().toISOString(),
    priceChange: 50,
    priceChangePercent: 1.59,
    minPrice: 3000,
    maxPrice: 3400,
    avgPrice: 3200
  },
  'corn': {
    name: 'Corn',
    category: 'Cereals',
    currentPrice: 1850,
    previousPrice: 1800,
    unit: 'per quintal',
    mandi: 'Pune',
    state: 'Maharashtra',
    lastUpdated: new Date().toISOString(),
    priceChange: 50,
    priceChangePercent: 2.78,
    minPrice: 1700,
    maxPrice: 2000,
    avgPrice: 1850
  },
  'tomato': {
    name: 'Tomato',
    category: 'Vegetables',
    currentPrice: 45,
    previousPrice: 50,
    unit: 'per kg',
    mandi: 'Bangalore',
    state: 'Karnataka',
    lastUpdated: new Date().toISOString(),
    priceChange: -5,
    priceChangePercent: -10.0,
    minPrice: 30,
    maxPrice: 60,
    avgPrice: 45
  },
  'potato': {
    name: 'Potato',
    category: 'Vegetables',
    currentPrice: 25,
    previousPrice: 28,
    unit: 'per kg',
    mandi: 'Kolkata',
    state: 'West Bengal',
    lastUpdated: new Date().toISOString(),
    priceChange: -3,
    priceChangePercent: -10.71,
    minPrice: 20,
    maxPrice: 35,
    avgPrice: 25
  },
  'onion': {
    name: 'Onion',
    category: 'Vegetables',
    currentPrice: 35,
    previousPrice: 40,
    unit: 'per kg',
    mandi: 'Nashik',
    state: 'Maharashtra',
    lastUpdated: new Date().toISOString(),
    priceChange: -5,
    priceChangePercent: -12.5,
    minPrice: 25,
    maxPrice: 50,
    avgPrice: 35
  },
  'mango': {
    name: 'Mango',
    category: 'Fruits',
    currentPrice: 80,
    previousPrice: 85,
    unit: 'per kg',
    mandi: 'Lucknow',
    state: 'Uttar Pradesh',
    lastUpdated: new Date().toISOString(),
    priceChange: -5,
    priceChangePercent: -5.88,
    minPrice: 60,
    maxPrice: 100,
    avgPrice: 80
  },
  'banana': {
    name: 'Banana',
    category: 'Fruits',
    currentPrice: 35,
    previousPrice: 32,
    unit: 'per kg',
    mandi: 'Chennai',
    state: 'Tamil Nadu',
    lastUpdated: new Date().toISOString(),
    priceChange: 3,
    priceChangePercent: 9.38,
    minPrice: 25,
    maxPrice: 45,
    avgPrice: 35
  },
  'apple': {
    name: 'Apple',
    category: 'Fruits',
    currentPrice: 120,
    previousPrice: 125,
    unit: 'per kg',
    mandi: 'Shimla',
    state: 'Himachal Pradesh',
    lastUpdated: new Date().toISOString(),
    priceChange: -5,
    priceChangePercent: -4.0,
    minPrice: 100,
    maxPrice: 150,
    avgPrice: 120
  },
  'cotton': {
    name: 'Cotton',
    category: 'Fiber',
    currentPrice: 6500,
    previousPrice: 6400,
    unit: 'per quintal',
    mandi: 'Ahmedabad',
    state: 'Gujarat',
    lastUpdated: new Date().toISOString(),
    priceChange: 100,
    priceChangePercent: 1.56,
    minPrice: 6000,
    maxPrice: 7000,
    avgPrice: 6500
  },
  'sugarcane': {
    name: 'Sugarcane',
    category: 'Cash Crops',
    currentPrice: 15,
    previousPrice: 14,
    unit: 'per kg',
    mandi: 'Meerut',
    state: 'Uttar Pradesh',
    lastUpdated: new Date().toISOString(),
    priceChange: 1,
    priceChangePercent: 7.14,
    minPrice: 12,
    maxPrice: 18,
    avgPrice: 15
  },
  'soybean': {
    name: 'Soybean',
    category: 'Oilseeds',
    currentPrice: 4200,
    previousPrice: 4100,
    unit: 'per quintal',
    mandi: 'Indore',
    state: 'Madhya Pradesh',
    lastUpdated: new Date().toISOString(),
    priceChange: 100,
    priceChangePercent: 2.44,
    minPrice: 3800,
    maxPrice: 4500,
    avgPrice: 4200
  },
  'mustard': {
    name: 'Mustard',
    category: 'Oilseeds',
    currentPrice: 4800,
    previousPrice: 4750,
    unit: 'per quintal',
    mandi: 'Jaipur',
    state: 'Rajasthan',
    lastUpdated: new Date().toISOString(),
    priceChange: 50,
    priceChangePercent: 1.05,
    minPrice: 4500,
    maxPrice: 5000,
    avgPrice: 4800
  },
  'chickpea': {
    name: 'Chickpea',
    category: 'Pulses',
    currentPrice: 5500,
    previousPrice: 5400,
    unit: 'per quintal',
    mandi: 'Bhopal',
    state: 'Madhya Pradesh',
    lastUpdated: new Date().toISOString(),
    priceChange: 100,
    priceChangePercent: 1.85,
    minPrice: 5000,
    maxPrice: 5800,
    avgPrice: 5500
  },
  'lentil': {
    name: 'Lentil',
    category: 'Pulses',
    currentPrice: 6200,
    previousPrice: 6100,
    unit: 'per quintal',
    mandi: 'Patna',
    state: 'Bihar',
    lastUpdated: new Date().toISOString(),
    priceChange: 100,
    priceChangePercent: 1.64,
    minPrice: 5800,
    maxPrice: 6500,
    avgPrice: 6200
  }
};

// Function to get all mandi prices
export const getAllMandiPrices = () => {
  return Object.values(MANDI_PRICES);
};

// Function to get prices by category
export const getPricesByCategory = (category) => {
  return Object.values(MANDI_PRICES).filter(item => 
    item.category.toLowerCase() === category.toLowerCase()
  );
};

// Function to search prices by name
export const searchMandiPrices = (searchTerm) => {
  if (!searchTerm) return getAllMandiPrices();
  
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  return Object.values(MANDI_PRICES).filter(item => 
    item.name.toLowerCase().includes(normalizedSearch) ||
    item.category.toLowerCase().includes(normalizedSearch) ||
    item.mandi.toLowerCase().includes(normalizedSearch) ||
    item.state.toLowerCase().includes(normalizedSearch)
  );
};

// Function to get price trends (top gainers/losers)
export const getPriceTrends = () => {
  const prices = getAllMandiPrices();
  
  const topGainers = [...prices]
    .filter(item => item.priceChange > 0)
    .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
    .slice(0, 5);
  
  const topLosers = [...prices]
    .filter(item => item.priceChange < 0)
    .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
    .slice(0, 5);
  
  return {
    topGainers,
    topLosers
  };
};

// Function to get prices by state
export const getPricesByState = (state) => {
  return Object.values(MANDI_PRICES).filter(item => 
    item.state.toLowerCase() === state.toLowerCase()
  );
};

// Function to get average prices by category
export const getAveragePricesByCategory = () => {
  const prices = getAllMandiPrices();
  const categoryGroups = {};
  
  prices.forEach(item => {
    if (!categoryGroups[item.category]) {
      categoryGroups[item.category] = [];
    }
    categoryGroups[item.category].push(item);
  });
  
  const averages = {};
  Object.keys(categoryGroups).forEach(category => {
    const items = categoryGroups[category];
    const avgPrice = items.reduce((sum, item) => sum + item.avgPrice, 0) / items.length;
    averages[category] = {
      category,
      averagePrice: Math.round(avgPrice),
      count: items.length,
      items: items
    };
  });
  
  return averages;
};

// Function to simulate real-time price updates
export const simulatePriceUpdate = () => {
  const prices = getAllMandiPrices();
  const updatedPrices = prices.map(item => {
    // Simulate small price fluctuations
    const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% fluctuation
    const newPrice = Math.round(item.currentPrice * (1 + fluctuation));
    const priceChange = newPrice - item.currentPrice;
    const priceChangePercent = (priceChange / item.currentPrice) * 100;
    
    return {
      ...item,
      currentPrice: newPrice,
      previousPrice: item.currentPrice,
      priceChange,
      priceChangePercent: Math.round(priceChangePercent * 100) / 100,
      lastUpdated: new Date().toISOString()
    };
  });
  
  return updatedPrices;
};

export default {
  getAllMandiPrices,
  getPricesByCategory,
  searchMandiPrices,
  getPriceTrends,
  getPricesByState,
  getAveragePricesByCategory,
  simulatePriceUpdate
};
