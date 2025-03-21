import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  createSocketConnection,
  setupHeartbeat,
} from "../services/socketService";
import { playNotification } from "../utils/soundUtils";
import { isOperatorLoggedIn, getCurrentOperator } from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const LiveChatContext = createContext();

export const LiveChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [operatorMode, setOperatorMode] = useState(false);
  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);
  const [chats, setChats] = useState({}); // clientId -> messages[]
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [operatorData, setOperatorData] = useState(null);

  // Define handleMessageReceived at the component level with useCallback
  const handleMessageReceived = useCallback((message) => {
    const clientId = message.from;

    setChats((prev) => ({
      ...prev,
      [clientId]: [
        ...(prev[clientId] || []),
        {
          id: Date.now(),
          text: message.text,
          fromClient: true,
          timestamp: message.timestamp,
        },
      ],
    }));

    // If this is a new client that we haven't seen before, add them to our list
    setClients((prev) => {
      if (!prev.find((c) => c.id === clientId)) {
        const newClient = { id: clientId, hasOperator: false };
        return [...prev, newClient];
      }
      return prev;
    });

    // Play notification when receiving a new message when not focused
    if (operatorMode && soundEnabled && !document.hasFocus()) {
      playNotification("notification.mp3", { volume: 0.5 });
    }
  }, [clients, operatorMode, soundEnabled]);

  // Check for authenticated operator on mount
  useEffect(() => {
    if (isOperatorLoggedIn()) {
      const operatorInfo = getCurrentOperator();
      setOperatorData(operatorInfo);
      // Only enable operator mode if we have valid operator data
      if (operatorInfo && operatorInfo.id) {
        setOperatorMode(true);
      }
    }
  }, []);

  useEffect(() => {
    // Only create the socket when in operator mode
    if (!operatorMode) return;

    // Use the socket service to create a connection
    const newSocket = createSocketConnection(API_URL);
    setSocket(newSocket);

    // Setup heartbeat
    const cleanupHeartbeat = setupHeartbeat(newSocket);

    return () => {
      cleanupHeartbeat();
      if (newSocket) newSocket.disconnect();
    };
  }, [operatorMode]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);

      // Register as operator with authenticated data if available
      const operatorInfo = operatorData || { id: `operator_${Date.now()}` };
      socket.emit("operator:connect", { 
        id: operatorInfo.id,
        name: operatorInfo.displayName || operatorInfo.username || "Operator"
      });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleClientsList = (clientsList) => {
      setClients(clientsList);
    };

    const handleNewClient = (client) => {
      setClients((prev) => [...prev, client]);

      // Play notification sound when in operator mode and sound is enabled
      if (operatorMode && soundEnabled) {
        playNotification("notification.mp3", { volume: 0.7 });
      }
    };

    const handleClientLeft = (data) => {
      setClients((prev) => prev.filter((client) => client.id !== data.id));

      if (currentClient?.id === data.id) {
        setCurrentClient(null);
      }
    };

    const handleClientUpdated = (updatedClient) => {
      setClients((prev) =>
        prev.map((client) =>
          client.id === updatedClient.id
            ? { ...client, ...updatedClient }
            : client
        )
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("clients:list", handleClientsList);
    socket.on("client:new", handleNewClient);
    socket.on("client:left", handleClientLeft);
    socket.on("client:updated", handleClientUpdated);
    socket.on("message:received", handleMessageReceived);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("clients:list", handleClientsList);
      socket.off("client:new", handleNewClient);
      socket.off("client:left", handleClientLeft);
      socket.off("client:updated", handleClientUpdated);
      socket.off("message:received", handleMessageReceived);
    };
  }, [socket, handleMessageReceived, currentClient, operatorMode, soundEnabled, operatorData]);

  const acceptClient = (clientId) => {
    if (!socket || !isConnected) return;

    socket.emit("operator:accept", { clientId });

    // Update local state
    setCurrentClient({ id: clientId });
    setClients((prev) =>
      prev.map((client) =>
        client.id === clientId ? { ...client, hasOperator: true } : client
      )
    );
  };

  const sendMessage = (text, clientId) => {
    if (!socket || !isConnected || !clientId) return;

    const message = {
      text,
      to: clientId,
      type: "text",
    };

    socket.emit("message:send", message);

    // Add to local chat
    setChats((prev) => ({
      ...prev,
      [clientId]: [
        ...(prev[clientId] || []),
        {
          id: Date.now(),
          text,
          fromClient: false, // from operator
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  };

  const enableOperatorMode = () => {
    setOperatorMode(true);
  };

  const disableOperatorMode = () => {
    setOperatorMode(false);
    setCurrentClient(null);
    setClients([]);
    setChats({});
  };

  const value = {
    isConnected,
    operatorMode,
    clients,
    currentClient,
    chats,
    enableOperatorMode,
    disableOperatorMode,
    acceptClient,
    sendMessage,
    setCurrentClient,
    soundEnabled,
    setSoundEnabled,
    operatorData,
    setOperatorData
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
