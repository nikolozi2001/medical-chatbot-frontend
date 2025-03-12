import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Divider,
  Avatar,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PropTypes from "prop-types";
import {
  createSocketConnection,
  setupHeartbeat,
} from "../services/socketService";
import { MESSAGE_TYPES } from "../constants/messageTypes";
import "./LiveChat.scss";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Helper function to generate unique IDs
const generateUniqueId = (() => {
  let counter = 0;
  return () => `msg_${Date.now()}_${counter++}`;
})();

const LiveChat = ({ onBack }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [operatorId, setOperatorId] = useState(null);
  const [clientId] = useState(`client_${Date.now()}`);
  const messagesEndRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Display a message telling the user to start the backend
  useEffect(() => {
    // Add initial message
    setMessages((prev) => [
      ...prev,
      {
        id: generateUniqueId(),
        text: "Connecting to chat service...",
        type: "system",
        timestamp: new Date().toISOString(),
      },
    ]);

    // If we're still connecting after 5 seconds, show a helpful message
    const timer = setTimeout(() => {
      if (isConnecting && !isConnected) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(),
            text: 'Having trouble connecting. Make sure the backend server is running with "npm run start:backend"',
            type: "system",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isConnecting, isConnected]);

  // Connect to socket server with error handling
  useEffect(() => {
    console.log(`Connecting to Socket.IO server at: ${API_URL}`);

    let socketInstance = null;
    let cleanupHeartbeat = () => {};

    // Only try to connect if we're not in an error state or if we've explicitly requested a retry
    if (connectionError && retryCountRef.current === 0) {
      setIsConnecting(false);
      return;
    }

    try {
      // Create socket instance using the socketService
      socketInstance = createSocketConnection(API_URL);

      // Connection successful
      socketInstance.on("connect", () => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(false);
        retryCountRef.current = 0;

        // Register as client
        socketInstance.emit("client:connect", { id: clientId });

        // Add success message
        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(),
            text: "Connected! Waiting for an available operator...",
            type: "system",
            timestamp: new Date().toISOString(),
          },
        ]);
      });

      // Connection failed
      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
        setConnectionError(true);
        setIsConnecting(false);

        if (retryCountRef.current < maxRetries) {
          retryCountRef.current += 1;
          console.log(
            `Retry attempt ${retryCountRef.current} of ${maxRetries}`
          );

          setMessages((prev) => [
            ...prev,
            {
              id: generateUniqueId(),
              text: `Connection attempt failed (${retryCountRef.current}/${maxRetries}). Retrying...`,
              type: "system",
              timestamp: new Date().toISOString(),
            },
          ]);

          // Auto-retry with a delay
          setTimeout(() => {
            if (socketInstance) {
              socketInstance.connect();
            }
          }, 3000);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: generateUniqueId(),
              text: "Could not connect to the chat service after multiple attempts. Please check if the backend server is running.",
              type: "system",
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      });

      // Handle other Socket.IO events
      socketInstance.on("disconnect", () => {
        setIsConnected(false);
        setOperatorId(null);

        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(),
            text: "Disconnected from chat. Please try again later.",
            type: "system",
            timestamp: new Date().toISOString(),
          },
        ]);
      });

      socketInstance.on("operator:status", (data) => {
        if (!data.available) {
          setMessages((prev) => [
            ...prev,
            {
              id: generateUniqueId(),
              text: "No operators are online. Visit /operator to login as an operator.",
              type: "system",
              timestamp: new Date().toISOString(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: generateUniqueId(),
              text: "Operators are online. Waiting for someone to assist you...",
              type: "system",
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      });

      socketInstance.on("chat:accepted", (data) => {
        setOperatorId(data.operatorId);

        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(),
            text: "An operator has joined the chat. You can now start messaging.",
            type: "system",
            timestamp: new Date().toISOString(),
          },
        ]);
      });

      socketInstance.on("message:received", (data) => {
        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(),
            text: data.text,
            from: data.from,
            type: data.type || "text",
            timestamp: data.timestamp,
          },
        ]);
      });

      // Set up heartbeat to keep connection alive
      cleanupHeartbeat = setupHeartbeat(socketInstance);

      setSocket(socketInstance);
    } catch (error) {
      console.error("Error initializing socket:", error);
      setConnectionError(true);
      setIsConnecting(false);

      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          text: "Failed to initialize chat connection.",
          type: "system",
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    // Clean up on unmount
    return () => {
      cleanupHeartbeat();

      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [API_URL, clientId, connectionError]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !isConnected || !socket) return;

    // Add to local messages
    setMessages((prev) => [
      ...prev,
      {
        id: generateUniqueId(),
        text: inputMessage,
        fromSelf: true,
        type: "text",
        timestamp: new Date().toISOString(),
      },
    ]);

    // Send to server
    socket.emit("message:send", {
      text: inputMessage,
      to: operatorId,
      type: "text",
    });

    setInputMessage("");
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Manual reconnection handler
  const handleManualReconnect = () => {
    retryCountRef.current = 0;
    setConnectionError(false);
    setIsConnecting(true);

    setMessages((prev) => [
      ...prev,
      {
        id: generateUniqueId(),
        text: "Attempting to reconnect...",
        type: "system",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <Box className="live-chat-container">
      {connectionError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleManualReconnect}
            >
              Retry
            </Button>
          }
        >
          {retryCountRef.current >= maxRetries
            ? "Could not connect to chat server. Is the backend running?"
            : "Connection error. Click Retry to try again."}
        </Alert>
      )}

      <Box className="live-chat-header">
        <IconButton onClick={onBack} edge="start" aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">ოპერატორთან ჩატი</Typography>
        {/* Connection status indicator removed */}
      </Box>

      <Divider />

      <Box className="messages-container">
        {messages.map((msg) => (
          <Box
            key={msg.id}
            className={`message ${msg.fromSelf ? "self" : "other"} ${
              msg.type === "system" ? "system" : ""
            }`}
          >
            {msg.type !== "system" && !msg.fromSelf && (
              <Avatar className="message-avatar">OP</Avatar>
            )}

            <Box className="message-bubble">
              <Typography variant="body1">{msg.text}</Typography>
              <Typography variant="caption" className="message-time">
                {formatTime(msg.timestamp)}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />

        {isConnecting && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>

      <Box
        component="form"
        onSubmit={handleSendMessage}
        className="message-input-container"
      >
        <TextField
          variant="outlined"
          fullWidth
          placeholder={
            operatorId ? "დაწერეთ შეტყობინება..." : "ველოდებით ოპერატორს..."
          }
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={!isConnected || !operatorId}
          InputProps={{
            endAdornment: (
              <Button
                color="primary"
                disabled={!isConnected || !operatorId || !inputMessage.trim()}
                type="submit"
              >
                <SendIcon />
              </Button>
            ),
          }}
        />
      </Box>
    </Box>
  );
};

LiveChat.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default LiveChat;
