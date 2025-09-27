import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient.js';
import { getMarketPrice, getPriceComparison } from '../services/marketPriceService.js';
import MarketPriceDisplay from '../components/MarketPriceDisplay.jsx';
import { formatLocation } from '../utils/locationUtils.js';

const BuyerDashboard = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    name: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  const searchCrops = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await apiClient.get(`/buyers/search-crops?${params}`);
      setCrops(response.data.data || []);
    } catch (error) {
      console.error('Error searching crops:', error);
      alert('Error searching crops: ' + (error.response?.data?.message || 'Unknown error'));
      setCrops([]);
    } finally {
      setLoading(false);
    }
  };

  const searchNearbyCrops = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await apiClient.get(
            `/buyers/search-nearby-crops?lat=${latitude}&lng=${longitude}&maxDistance=50000`
          );
          setCrops(response.data.data || []);
        } catch (error) {
          console.error('Error searching nearby crops:', error);
          alert('Error searching nearby crops: ' + (error.response?.data?.message || 'Unknown error'));
          setCrops([]);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Error getting your location. Please try again.');
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    console.log('BuyerDashboard mounted, searching crops...');
    searchCrops();
  }, []);

  return (
    <div className="space-y-6">
      {/* Market Price Display */}
      <MarketPriceDisplay crops={crops} />
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard - Marketplace</h1>
          <div className="space-x-2">
            <Link
              to="/market-prices"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              📊 Market Prices
            </Link>
            <Link
              to="/buyer/orders"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              View Order History
            </Link>
          </div>
        </div>
        
        {/* Search Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Crop name"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            value={searchParams.name}
            onChange={(e) => setSearchParams({...searchParams, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Category"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            value={searchParams.category}
            onChange={(e) => setSearchParams({...searchParams, category: e.target.value})}
          />
          <input
            type="number"
            placeholder="Min Price"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            value={searchParams.minPrice}
            onChange={(e) => setSearchParams({...searchParams, minPrice: e.target.value})}
          />
          <input
            type="number"
            placeholder="Max Price"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            value={searchParams.maxPrice}
            onChange={(e) => setSearchParams({...searchParams, maxPrice: e.target.value})}
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={searchCrops}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Crops'}
          </button>
          <button
            onClick={searchNearbyCrops}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Find Nearby Crops'}
          </button>
        </div>
      </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crops.map((crop) => (
          <CropCard key={crop._id} crop={crop} />
        ))}
      </div>
      
      {crops.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No crops found. Try adjusting your search criteria.
        </div>
      )}
    </div>
  );
};

const CropCard = ({ crop }) => {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({
    quantity: '',
    buyerLocation: '',
    farmerLocation: ''
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [marketPrice, setMarketPrice] = useState(null);
  const [priceComparison, setPriceComparison] = useState(null);

  // Fetch market price data when component mounts
  useEffect(() => {
    const marketData = getMarketPrice(crop.name);
    const comparison = getPriceComparison(crop.name, crop.price);
    setMarketPrice(marketData);
    setPriceComparison(comparison);
  }, [crop.name, crop.price]);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const location = await reverseGeocode(latitude, longitude);
            resolve(location);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.city && data.principalSubdivision) {
        return `${data.city}, ${data.principalSubdivision}`;
      } else if (data.locality && data.principalSubdivision) {
        return `${data.locality}, ${data.principalSubdivision}`;
      } else {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const detectLocations = async () => {
    setLocationLoading(true);
    try {
      // Get buyer's current location
      const buyerLocation = await getCurrentLocation();
      
      // Set farmer location from crop data
      const farmerLocation = formatLocation(crop.location);
      
      setOrderData({
        ...orderData,
        buyerLocation,
        farmerLocation
      });
    } catch (error) {
      console.error('Location detection failed:', error);
      alert('Unable to detect your location. Please enter manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const placeOrder = async () => {
    if (!orderData.quantity || !orderData.buyerLocation || !orderData.farmerLocation) {
      alert('Please fill all fields');
      return;
    }

    try {
      // Create mock coordinates for location (in a real app, you'd get these from geocoding)
      const mockCoordinates = [77.2090, 28.6139]; // Default to Delhi coordinates
      
      const response = await apiClient.post('/buyers/place-order', {
        cropId: crop._id,
        quantity: parseInt(orderData.quantity),
        buyerLocation: JSON.stringify({
          type: "Point",
          coordinates: mockCoordinates
        }),
        farmerLocation: JSON.stringify({
          type: "Point", 
          coordinates: mockCoordinates
        })
      });
      
      alert('Order placed successfully!');
      setShowOrderForm(false);
      setOrderData({ quantity: '', buyerLocation: '', farmerLocation: '' });
      
      // Refresh the crops list to show updated quantities
      searchCrops();
    } catch (error) {
      console.error('Order placement error:', error);
      alert('Error placing order: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {crop.images && crop.images.length > 0 && (
        <img
          src={crop.images[0]}
          alt={crop.name}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{crop.category}</p>
        <p className="text-gray-700 mb-4">{crop.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-green-600">₹{crop.price}</span>
            <span className="text-sm text-gray-500">Qty: {crop.quantity}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-600">
              Market: ₹{marketPrice?.price || 'N/A'}
              {marketPrice?.unit && <span className="text-xs text-gray-500"> {marketPrice.unit}</span>}
            </span>
            <span className="text-xs text-gray-500">
              {formatLocation(crop.location)}
            </span>
          </div>
          {priceComparison && (
            <div className="text-xs text-gray-600">
              {priceComparison.isBelowMarket ? (
                <span className="text-green-600">💰 Good Deal! {priceComparison.percentageDiff}% below market</span>
              ) : priceComparison.isAboveMarket ? (
                <span className="text-orange-600">⚠️ {priceComparison.percentageDiff}% above market</span>
              ) : (
                <span className="text-blue-600">📊 At market price</span>
              )}
            </div>
          )}
          {marketPrice?.lastUpdated && (
            <div className="text-xs text-gray-400">
              Market data updated: {new Date(marketPrice.lastUpdated).toLocaleDateString()}
            </div>
          )}
        </div>
        
        {crop.quantity > 0 ? (
          <button
            onClick={() => {
              setShowOrderForm(true);
              // Auto-detect locations when opening the form
              setTimeout(() => {
                detectLocations();
              }, 100);
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
          >
            Place Order
          </button>
        ) : (
          <button
            disabled
            className="w-full bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Place Order</h3>
            
            <div className="mb-4">
              <button
                onClick={detectLocations}
                disabled={locationLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 flex items-center justify-center"
              >
                {locationLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Detecting Location...
                  </>
                ) : (
                  <>
                    📍 Auto-Detect Locations
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={crop.quantity}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={orderData.quantity}
                  onChange={(e) => setOrderData({...orderData, quantity: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Location 
                  {orderData.buyerLocation && <span className="text-green-600 text-xs ml-2">✓ Auto-detected</span>}
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Click 'Auto-Detect' or enter manually"
                  value={orderData.buyerLocation}
                  onChange={(e) => setOrderData({...orderData, buyerLocation: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Farmer Location
                  {orderData.farmerLocation && <span className="text-green-600 text-xs ml-2">✓ From crop data</span>}
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Farmer's location from crop listing"
                  value={orderData.farmerLocation}
                  onChange={(e) => setOrderData({...orderData, farmerLocation: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={placeOrder}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
              >
                Place Order
              </button>
              <button
                onClick={() => setShowOrderForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
