// Import JWT Decode - to install, run: npm install jwt-decode
import { jwtDecode } from 'jwt-decode';

// Store the API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create a safe decode function that won't break if jwt-decode isn't available
const safeJwtDecode = (token) => {
  try {
    return jwtDecode(token);
  } catch (err) {
    console.error('Error decoding token:', err);
    return { token };
  }
};

// Authentication service
export const login = async (username, password) => {
  try {
    // Replace with actual API call to authenticate
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Authentication failed');
    }

    const data = await response.json();
    const { token } = data;
    
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    
    // Return user data
    const user = safeJwtDecode(token);
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('authToken');
};

export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    // Check if token is expired
    const decoded = safeJwtDecode(token);
    
    // If we can't decode the token properly, return null
    if (!decoded || !decoded.exp) return decoded;
    
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      logout();
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Error getting current user:', error);
    logout();
    return null;
  }
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

/**
 * Register a new operator
 * @param {Object} operatorData - The operator registration data
 * @returns {Promise} - Promise with the registration response
 */
export const registerOperator = async (operatorData) => {
  try {
    const response = await fetch(`${API_URL}/api/operators/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(operatorData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('operatorToken', data.token);
      localStorage.setItem('operatorData', JSON.stringify(data.operator));
    }
    
    return data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

/**
 * Login an operator
 * @param {Object} credentials - The login credentials
 * @returns {Promise} - Promise with the login response
 */
export const loginOperator = async (credentials) => {
  try {
    console.log('Attempting login with:', { ...credentials, password: '***' });
    
    const response = await fetch(`${API_URL}/api/operators/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Login failed with status:', response.status, data);
      throw new Error(data.message || 'Login failed');
    }
    
    console.log('Login successful:', data);
    
    // Store token in localStorage - don't modify the token format from the server
    if (data.token) {
      localStorage.setItem('operatorToken', data.token);
      localStorage.setItem('operatorData', JSON.stringify(data.operator));
    }
    
    return data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

/**
 * Logout the operator
 */
export const logoutOperator = () => {
  localStorage.removeItem('operatorToken');
  localStorage.removeItem('operatorData');
};

/**
 * Check if operator is logged in
 * @returns {Boolean} - True if operator is logged in
 */
export const isOperatorLoggedIn = () => {
  const token = localStorage.getItem('operatorToken');
  return !!token;
};

/**
 * Get current operator data
 * @returns {Object|null} - The operator data or null if not logged in
 */
export const getCurrentOperator = () => {
  const operatorData = localStorage.getItem('operatorData');
  return operatorData ? JSON.parse(operatorData) : null;
};
