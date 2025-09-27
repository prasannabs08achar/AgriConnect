import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient.js';

const BuyerOrdersHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get('/buyers/get-buyer-orders-history');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderWithDistance = async (orderId) => {
    try {
      const response = await apiClient.get(`/buyers/get-orders-with-distance/${orderId}`);
      const { order, distance } = response.data.data;
      alert(`Distance to farmer: ${distance}`);
    } catch (error) {
      console.error('Error fetching order distance:', error);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await apiClient.post(`/buyers/cancel-order/${orderId}`);
      alert('Order cancelled successfully!');
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Error cancelling order: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order History</h1>
        
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{order.crop?.name}</h3>
                    <p className="text-sm text-gray-600">Category: {order.crop?.category}</p>
                    <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                    <p className="text-sm text-gray-600">Total Price: ₹{order.price}</p>
                    <p className="text-sm text-gray-500">
                      Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">Farmer: {order.crop?.farmer?.name}</p>
                    <p className="text-sm text-gray-600">{order.crop?.farmer?.phone}</p>
                    <p className="text-sm font-medium">
                      Status: <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status?.toUpperCase()}
                      </span>
                    </p>
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => getOrderWithDistance(order._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Get Distance
                      </button>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => cancelOrder(order._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No orders found. Start by browsing and ordering crops!
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerOrdersHistory;

