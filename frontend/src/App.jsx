import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import BuyerDashboard from './pages/BuyerDashboard.jsx';
import BuyerOrdersHistory from './pages/BuyerOrdersHistory.jsx';
import FarmerDashboard from './pages/FarmerDashboard.jsx';
import MarketPrice from './pages/MarketPrice.jsx';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/buyer/dashboard" element={
            <ProtectedRoute requiredRole="buyer">
              <Layout>
                <BuyerDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/buyer/orders" element={
            <ProtectedRoute requiredRole="buyer">
              <Layout>
                <BuyerOrdersHistory />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/farmer/dashboard" element={
            <ProtectedRoute requiredRole="farmer">
              <Layout>
                <FarmerDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/market-prices" element={
            <ProtectedRoute>
              <Layout>
                <MarketPrice />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Unauthorized Route */}
          <Route path="/unauthorized" element={
            <Layout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                  Unauthorized Access
                </h1>
                <p className="text-gray-600">
                  You don't have permission to access this page.
                </p>
              </div>
            </Layout>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App
