import { jwtDecode } from "jwt-decode";

// Store the API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
    const user = jwtDecode(token);
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
    const decoded = jwtDecode(token);
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
