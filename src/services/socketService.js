import { io } from 'socket.io-client';

/**
 * Creates and configures a socket connection
 * @param {string} url - The URL to connect to
 * @param {Object} options - Additional socket options
 * @returns {Socket} - The configured socket instance
 */
export const createSocketConnection = (url, options = {}) => {
  const defaultOptions = {
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
    timeout: 10000,
    autoConnect: true,
    transports: ['polling', 'websocket']
  };
  
  const socketOptions = {
    ...defaultOptions,
    ...options
  };
  
  try {
    return io(url, socketOptions);
  } catch (error) {
    console.error("Error creating socket connection:", error);
    throw error;
  }
};

/**
 * Setup heartbeat mechanism to keep connection alive
 * @param {Socket} socket - The socket instance
 * @param {number} interval - Interval in milliseconds
 * @returns {Function} - Cleanup function
 */
export const setupHeartbeat = (socket, interval = 25000) => {
  if (!socket) return () => {};
  
  const heartbeatInterval = setInterval(() => {
    if (socket && socket.connected) {
      socket.emit('ping');
    }
  }, interval);
  
  return () => clearInterval(heartbeatInterval);
};
