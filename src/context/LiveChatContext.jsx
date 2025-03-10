import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import PropTypes from 'prop-types';

// Use environment variable or fallback
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

const LiveChatContext = createContext();

export const LiveChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [agentStatus, setAgentStatus] = useState('offline'); // offline, online, busy
  const [liveChatHistory, setLiveChatHistory] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [queuePosition, setQueuePosition] = useState(0);

  // Initialize socket connection
  useEffect(() => {
    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
    });

    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('agent_status', (status) => {
      setAgentStatus(status);
    });

    newSocket.on('chat_started', (chatData) => {
      setActiveChat(chatData);
      setIsWaiting(false);
    });

    newSocket.on('queue_position', (position) => {
      setQueuePosition(position);
    });

    newSocket.on('message', (message) => {
      setLiveChatHistory((prev) => [...prev, message]);
    });

    newSocket.on('chat_ended', () => {
      setActiveChat(null);
      // Keep chat history for reference
    });

    setSocket(newSocket);

    // Clean up
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  // Connect to socket when needed
  const connectToSocket = () => {
    if (socket && !isConnected) {
      socket.connect();
    }
  };

  // Initialize a chat request
  const requestLiveChat = (userData) => {
    if (!socket || !isConnected) {
      connectToSocket();
    }
    
    setIsWaiting(true);
    setLiveChatHistory([]);
    socket.emit('request_chat', userData);
  };

  // Send a message
  const sendMessage = (message) => {
    if (socket && isConnected && activeChat) {
      const messageData = {
        chatId: activeChat.id,
        sender: 'user',
        text: message,
        timestamp: new Date().toISOString(),
      };
      
      socket.emit('send_message', messageData);
      setLiveChatHistory((prev) => [...prev, messageData]);
    }
  };

  // End the chat
  const endChat = () => {
    if (socket && isConnected && activeChat) {
      socket.emit('end_chat', { chatId: activeChat.id });
      setActiveChat(null);
    }
  };

  const value = {
    isConnected,
    agentStatus,
    liveChatHistory,
    isWaiting,
    activeChat,
    queuePosition,
    requestLiveChat,
    sendMessage,
    endChat,
  };

  return (
    <LiveChatContext.Provider value={value}>
      {children}
    </LiveChatContext.Provider>
  );
};

LiveChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useLiveChat = () => useContext(LiveChatContext);

export default LiveChatContext;
