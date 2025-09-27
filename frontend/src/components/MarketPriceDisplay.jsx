import { useState, useEffect } from 'react';
import { getAllMarketPrices } from '../services/marketPriceService.js';

const MarketPriceDisplay = ({ crops = [], showAll = false }) => {
  const [marketPrices, setMarketPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prices = getAllMarketPrices();
    setMarketPrices(prices);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // If crops are provided, show only those crops' market prices
  // Otherwise, show popular crops
  let cropsToShow = [];
  
  if (crops && crops.length > 0) {
    // Get unique crop names from the provided crops
    const uniqueCropNames = [...new Set(crops.map(crop => crop.name?.toLowerCase().trim()))];
    cropsToShow = uniqueCropNames.slice(0, 8); // Limit to 8 crops
  } else if (showAll) {
    // Show all available crops
    cropsToShow = Object.keys(marketPrices).slice(0, 12);
  } else {
    // Show popular crops by default
    cropsToShow = ['wheat', 'rice', 'tomato', 'potato', 'onion', 'mango', 'banana', 'apple'];
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {crops && crops.length > 0 ? 'Market Prices for Available Crops' : 'Current Market Prices'}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cropsToShow.map((cropName) => {
          const cropData = marketPrices[cropName];
          if (!cropData) return null;
          
          return (
            <div key={cropName} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 capitalize">
                {cropName}
              </div>
              <div className="text-lg font-bold text-green-600">
                ₹{cropData.price}
              </div>
              <div className="text-xs text-gray-500">
                {cropData.unit}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-xs text-gray-400 text-center">
        Prices updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default MarketPriceDisplay;
