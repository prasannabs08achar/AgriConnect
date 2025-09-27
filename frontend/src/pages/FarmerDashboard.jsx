import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient.js';
import { getMarketPrice, getPriceComparison } from '../services/marketPriceService.js';
import MarketPriceDisplay from '../components/MarketPriceDisplay.jsx';
import { formatLocation } from '../utils/locationUtils.js';

const FarmerDashboard = () => {
  const [crops, setCrops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddCropForm, setShowAddCropForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCrops: 0,
    pendingOrders: 0
  });
  const [locationLoading, setLocationLoading] = useState(false);

  const [cropForm, setCropForm] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    harvestDate: '',
    description: '',
    location: '',
    images: null
  });

  useEffect(() => {
    console.log('FarmerDashboard mounted, fetching data...');
    fetchFarmerOrders();
    fetchFarmerCrops();
    calculateAnalytics();
  }, [orders, crops]);

  const fetchFarmerOrders = async () => {
    try {
      const response = await apiClient.get('/farmers/get-farmer-orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchFarmerCrops = async () => {
    try {
      const response = await apiClient.get('/farmers/get-farmer-crops');
      setCrops(response.data.data);
    } catch (error) {
      console.error('Error fetching crops:', error);
    }
  };

  const calculateAnalytics = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0);
    const totalCrops = crops.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    
    setAnalytics({
      totalOrders,
      totalRevenue,
      totalCrops,
      pendingOrders
    });
  };

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

  const detectFarmerLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await getCurrentLocation();
      setCropForm({
        ...cropForm,
        location
      });
    } catch (error) {
      console.error('Location detection failed:', error);
      alert('Unable to detect your location. Please enter manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setCropForm({
      ...cropForm,
      images: e.target.files
    });
  };

  const handleLocationChange = (e) => {
    setCropForm({
      ...cropForm,
      location: e.target.value
    });
  };

  const addCrop = async () => {
    if (!cropForm.images || cropForm.images.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', cropForm.name);
      formData.append('category', cropForm.category);
      formData.append('quantity', cropForm.quantity);
      formData.append('price', cropForm.price);
      formData.append('harvestDate', cropForm.harvestDate);
      formData.append('description', cropForm.description);
      formData.append('location', cropForm.location);
      
      Array.from(cropForm.images).forEach((file) => {
        formData.append('images', file);
      });

      await apiClient.post('/farmers/add-crop', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Crop added successfully!');
      setShowAddCropForm(false);
      resetForm();
      fetchFarmerCrops(); // Refresh crops list
    } catch (error) {
      alert('Error adding crop: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const updateCrop = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', cropForm.name);
      formData.append('category', cropForm.category);
      formData.append('quantity', cropForm.quantity);
      formData.append('price', cropForm.price);
      formData.append('harvestDate', cropForm.harvestDate);
      formData.append('description', cropForm.description);
      formData.append('location', cropForm.location);
      
      if (cropForm.images && cropForm.images.length > 0) {
        Array.from(cropForm.images).forEach((file) => {
          formData.append('images', file);
        });
      }

      await apiClient.post(`/farmers/update-crop/${editingCrop._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Crop updated successfully!');
      setEditingCrop(null);
      resetForm();
      fetchFarmerCrops(); // Refresh crops list
    } catch (error) {
      alert('Error updating crop: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const deleteCrop = async (cropId) => {
    if (!confirm('Are you sure you want to delete this crop?')) return;

    try {
      await apiClient.delete(`/farmers/delete-crop/${cropId}`);
      alert('Crop deleted successfully!');
      fetchFarmerCrops(); // Refresh crops list
    } catch (error) {
      alert('Error deleting crop: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setCropForm({
      name: '',
      category: '',
      quantity: '',
      price: '',
      harvestDate: '',
      description: '',
      location: '',
      images: null
    });
  };

  const startEdit = (crop) => {
    setEditingCrop(crop);
    setCropForm({
      name: crop.name,
      category: crop.category,
      quantity: crop.quantity,
      price: crop.price,
      harvestDate: crop.harvestDate,
      description: crop.description,
      location: formatLocation(crop.location),
      images: null
    });
    setShowAddCropForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Market Price Display */}
      <MarketPriceDisplay crops={crops} />
      
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">📦</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Crops</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalCrops}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">📋</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">⏳</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.pendingOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">₹</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">₹{analytics.totalRevenue}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
          <div className="space-x-2">
            <Link
              to="/market-prices"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              📊 Market Prices
            </Link>
            <button
              onClick={() => {
                setShowAddCropForm(true);
                setEditingCrop(null);
                resetForm();
                // Auto-detect location when opening the form
                setTimeout(() => {
                  detectFarmerLocation();
                }, 100);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Add New Crop
            </button>
          </div>
        </div>

        {/* Orders Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{order.crop?.name}</h3>
                      <p className="text-sm text-gray-600">Category: {order.crop?.category}</p>
                      <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                      <p className="text-sm text-gray-600">Price: ₹{order.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Buyer: {order.buyer?.name}</p>
                      <p className="text-sm text-gray-600">{order.buyer?.email}</p>
                      <p className="text-sm text-gray-600">{order.buyer?.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No orders yet</p>
          )}
        </div>

        {/* My Crops Marketplace */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Crops Marketplace</h2>
          {crops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crops.map((crop) => (
                <div key={crop._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  {crop.images && crop.images.length > 0 && (
                    <img
                      src={crop.images[0]}
                      alt={crop.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{crop.category}</p>
                    <p className="text-gray-700 mb-4 text-sm">{crop.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">₹{crop.price}</span>
                        <span className="text-sm text-gray-500">Qty: {crop.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600">
                          Market: ₹{getMarketPrice(crop.name)?.price || 'N/A'}
                          {getMarketPrice(crop.name)?.unit && <span className="text-xs text-gray-500"> {getMarketPrice(crop.name).unit}</span>}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatLocation(crop.location)}
                        </span>
                      </div>
                      {getPriceComparison(crop.name, crop.price) && (
                        <div className="text-xs text-gray-600">
                          {getPriceComparison(crop.name, crop.price).isBelowMarket ? (
                            <span className="text-green-600">💰 {getPriceComparison(crop.name, crop.price).percentageDiff}% below market</span>
                          ) : getPriceComparison(crop.name, crop.price).isAboveMarket ? (
                            <span className="text-orange-600">⚠️ {getPriceComparison(crop.name, crop.price).percentageDiff}% above market</span>
                          ) : (
                            <span className="text-blue-600">📊 At market price</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(crop)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCrop(crop._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No crops listed yet. Add your first crop to start selling!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Crop Form Modal */}
      {showAddCropForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingCrop ? 'Edit Crop' : 'Add New Crop'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Crop Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={cropForm.name}
                  onChange={(e) => setCropForm({...cropForm, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={cropForm.category}
                  onChange={(e) => setCropForm({...cropForm, category: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={cropForm.quantity}
                  onChange={(e) => setCropForm({...cropForm, quantity: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Price per Unit</label>
                <input
                  type="number"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={cropForm.price}
                  onChange={(e) => setCropForm({...cropForm, price: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Harvest Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={cropForm.harvestDate}
                  onChange={(e) => setCropForm({...cropForm, harvestDate: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                rows="3"
                value={cropForm.description}
                onChange={(e) => setCropForm({...cropForm, description: e.target.value})}
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Location
                {cropForm.location && <span className="text-green-600 text-xs ml-2">✓ Auto-detected</span>}
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your location (e.g., Mumbai, Maharashtra)"
                  value={cropForm.location}
                  onChange={handleLocationChange}
                />
                <button
                  type="button"
                  onClick={detectFarmerLocation}
                  disabled={locationLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 flex items-center"
                >
                  {locationLoading ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    '📍'
                  )}
                </button>
              </div>
            </div>
            
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={editingCrop ? updateCrop : addCrop}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingCrop ? 'Update Crop' : 'Add Crop')}
              </button>
              <button
                onClick={() => {
                  setShowAddCropForm(false);
                  setEditingCrop(null);
                  resetForm();
                }}
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

export default FarmerDashboard;

