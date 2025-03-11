/**
 * API configuration
 */

// Base API URL
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Chat endpoint
export const CHAT_ENDPOINT = `${API_URL}/chat`;

// File upload endpoint
export const UPLOAD_ENDPOINT = `${CHAT_ENDPOINT}/upload`;

// Socket server URL
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

export default {
  API_URL,
  CHAT_ENDPOINT,
  UPLOAD_ENDPOINT,
  SOCKET_URL
};
