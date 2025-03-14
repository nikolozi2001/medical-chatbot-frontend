import { useState, useEffect, useCallback, useRef } from 'react';
import { createSocketConnection, setupHeartbeat } from "../services/socketService";

export function useSocketConnection(url, options = {}) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;
  
  const connect = useCallback(() => {
    if (socket) return;
    
    const newSocket = createSocketConnection(url);
    setSocket(newSocket);
    
    const cleanupHeartbeat = setupHeartbeat(newSocket);
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
      if (options.onConnect) options.onConnect(newSocket);
    });
    
    newSocket.on('disconnect', () => {
      setIsConnected(false);
      if (options.onDisconnect) options.onDisconnect();
    });
    
    newSocket.on('connect_error', (error) => {
      console.error("Socket connection error:", error);
      reconnectAttempts.current += 1;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        newSocket.disconnect();
        if (options.onMaxReconnectAttemptsReached) {
          options.onMaxReconnectAttemptsReached();
        }
      }
    });
    
    return () => {
      cleanupHeartbeat();
      newSocket.disconnect();
    };
  }, [url, options, socket]);
  
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);
  
  useEffect(() => {
    if (options.autoConnect !== false) {
      const cleanup = connect();
      return cleanup;
    }
  }, [connect, options.autoConnect]);
  
  return {
    socket,
    isConnected,
    connect,
    disconnect
  };
}
