import { useAuth } from '../contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user, isFarmer, isBuyer } = useAuth();

  return (
    <div className="text-center py-12 bg-gradient-to-r from-green-400 to-blue-500 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
        Welcome to AgriConnect
      </h1>
      <p className="text-xl text-white mb-8 shadow-lg">
        Connecting farmers and buyers for a better agricultural future
      </p>
      <div className="space-x-4 mb-8">
        {/* Show Buyer Dashboard button only for buyers */}
        {isBuyer && (
          <Link
            to="/buyer/dashboard"
            className="bg-white hover:bg-gray-100 text-green-600 px-6 py-3 rounded-lg font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Buyer Dashboard
          </Link>
        )}
        
        {/* Show Farmer Dashboard button only for farmers */}
        {isFarmer && (
          <Link
            to="/farmer/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Farmer Dashboard
          </Link>
        )}
        
        {/* If user has no specific role or both roles, show both buttons */}
        {!isFarmer && !isBuyer && (
          <>
            <Link
              to="/buyer/dashboard"
              className="bg-white hover:bg-gray-100 text-green-600 px-6 py-3 rounded-lg font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Buyer Dashboard
            </Link>
            <Link
              to="/farmer/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Farmer Dashboard
            </Link>
          </>
        )}
        
        {/* Market Prices - Available to all users */}
        <Link
          to="/market-prices"
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          📊 Market Prices
        </Link>
      </div>
      
      {/* Welcome message with user info */}
      {user && (
        <div className="text-white text-lg">
          Welcome back, <span className="font-semibold">{user.name}</span>!
        </div>
      )}
    </div>
  );
};

export default Home;
