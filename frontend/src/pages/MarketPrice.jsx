import { useState, useEffect } from 'react';
import { 
  getAllMandiPrices, 
  getPricesByCategory, 
  searchMandiPrices, 
  getPricesByState,
  getAveragePricesByCategory 
} from '../services/mandiPriceService.js';

const MarketPrice = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categoryAverages, setCategoryAverages] = useState({});

  const categories = ['All', 'Cereals', 'Vegetables', 'Fruits', 'Pulses', 'Oilseeds', 'Fiber', 'Cash Crops'];
  const states = ['All', 'Delhi', 'Maharashtra', 'Karnataka', 'West Bengal', 'Uttar Pradesh', 'Tamil Nadu', 'Himachal Pradesh', 'Gujarat', 'Madhya Pradesh', 'Rajasthan', 'Bihar'];

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = () => {
    setLoading(true);
    try {
      const allPrices = getAllMandiPrices();
      setPrices(allPrices);
      
      const averages = getAveragePricesByCategory();
      setCategoryAverages(averages);
    } catch (error) {
      console.error('Error loading prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    let filteredPrices = searchMandiPrices(term);
    
    if (selectedCategory !== 'All') {
      filteredPrices = filteredPrices.filter(item => item.category === selectedCategory);
    }
    
    if (selectedState !== 'All') {
      filteredPrices = filteredPrices.filter(item => item.state === selectedState);
    }
    
    setPrices(filteredPrices);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    let filteredPrices = searchMandiPrices(searchTerm);
    
    if (category !== 'All') {
      filteredPrices = filteredPrices.filter(item => item.category === category);
    }
    
    if (selectedState !== 'All') {
      filteredPrices = filteredPrices.filter(item => item.state === selectedState);
    }
    
    setPrices(filteredPrices);
  };

  const handleStateFilter = (state) => {
    setSelectedState(state);
    let filteredPrices = searchMandiPrices(searchTerm);
    
    if (selectedCategory !== 'All') {
      filteredPrices = filteredPrices.filter(item => item.category === selectedCategory);
    }
    
    if (state !== 'All') {
      filteredPrices = filteredPrices.filter(item => item.state === state);
    }
    
    setPrices(filteredPrices);
  };

  const handleSort = (field) => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newSortOrder);
    
    const sortedPrices = [...prices].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (newSortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setPrices(sortedPrices);
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Market Price Dashboard</h1>
          <button
            onClick={loadPrices}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            🔄 Refresh Prices
          </button>
        </div>
        <p className="text-gray-600">
          Real-time agricultural commodity prices from major mandis across India
        </p>
      </div>


      {/* Category Averages */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Average Prices by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.values(categoryAverages).map((category, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{category.category}</h4>
              <p className="text-2xl font-bold text-green-600">₹{category.averagePrice}</p>
              <p className="text-sm text-gray-500">{category.count} items</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filters & Search</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search commodities..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={selectedState}
              onChange={(e) => handleStateFilter(e.target.value)}
            >
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
                handleSort(field);
              }}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="currentPrice-asc">Price (Low to High)</option>
              <option value="currentPrice-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Price Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Current Market Prices ({prices.length} commodities)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Commodity {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('currentPrice')}
                >
                  Current Price {sortBy === 'currentPrice' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min-Max Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mandi Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prices.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">
                            {item.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">₹{item.currentPrice}</div>
                    <div className="text-sm text-gray-500">Prev: ₹{item.previousPrice}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{item.minPrice} - ₹{item.maxPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.mandi}</div>
                    <div className="text-sm text-gray-500">{item.state}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-blue-600">ℹ️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <strong>Data Source:</strong> This data is for demonstration purposes. 
              In production, this would be connected to real Mandi APIs like e-NAM, Agmarknet, 
              or other government agricultural price databases for accurate, real-time pricing information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPrice;
