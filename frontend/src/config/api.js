// API Configuration
export const API_BASE_URL = '/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/users/register',
  LOGIN: '/users/login',
  LOGOUT: '/users/logout',
  REFRESH_TOKEN: '/users/refresh-access-token',
  GET_CURRENT_USER: '/users/get-current-user',
  UPDATE_ACCOUNT: '/users/update-account-details',
  CHANGE_PASSWORD: '/users/change-current-password',
  
  // Buyer endpoints
  SEARCH_CROPS: '/buyers/search-crops',
  SEARCH_NEARBY_CROPS: '/buyers/search-nearby-crops',
  PLACE_ORDER: '/buyers/place-order',
  GET_BUYER_ORDERS: '/buyers/get-buyer-orders-history',
  GET_ORDER_WITH_DISTANCE: '/buyers/get-orders-with-distance',
  
  // Farmer endpoints
  ADD_CROP: '/farmers/add-crop',
  UPDATE_CROP: '/farmers/update-crop',
  DELETE_CROP: '/farmers/delete-crop',
  GET_FARMER_ORDERS: '/farmers/get-farmer-orders'
};
