/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import {
  Typography,
  Button,
  CircularProgress,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import InputForm from "./components/InputForm";
import ResponseDisplay from "./components/ResponseDisplay";
import Modal from "./components/Modal";
import SmsSvg from "./assets/icons/sms.svg";
import LiveCallerWidget from "./components/LiveCallerWidget";
import ChatHistory from "./components/ChatHistory";
import LiveChat from "./components/LiveChat";
import OperatorPanel from "./pages/OperatorPanel";
import OperatorSignup from "./pages/OperatorSignup";
import OperatorLogin from "./pages/OperatorLogin";
import { LiveChatProvider } from "./context/LiveChatContext";
import { CHAT_ENDPOINT } from "./config/api";
import { sendChatMessage, uploadFile, fetchChatHistory, deleteChatSession, clearChatHistory } from "./services/chatService";
import "./App.css";

const AppContent = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // Current chat history
  const [allChats, setAllChats] = useState([]); // All past conversations
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLiveCaller, setShowLiveCaller] = useState(true);
  const [showChatForm, setShowChatForm] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sessionId, setSessionId] = useState("");
  const [pendingMessages, setPendingMessages] = useState([]);

  const MAX_CHARS = 500; // Maximum character limit

  // Fetch chat history from API instead of localStorage on component mount
  useEffect(() => {
    const fetchAndSetChatHistory = async () => {
      try {
        const history = await fetchChatHistory();
        if (history && history.length > 0) {
          setAllChats(history);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        // Fall back to localStorage if API fails
        const savedChats = localStorage.getItem("medicalChatHistory");
        if (savedChats) {
          setAllChats(JSON.parse(savedChats));
        }
      }
    };

    fetchAndSetChatHistory();

    // Set up online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Generate a session ID for this conversation
    setSessionId(`session_${Date.now()}`);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      const updatedAllChats = [...allChats];
      const existingSessionIndex = updatedAllChats.findIndex(
        (chat) => chat.id === sessionId
      );

      if (existingSessionIndex >= 0) {
        updatedAllChats[existingSessionIndex].messages = chatHistory;
      } else {
        updatedAllChats.push({
          id: sessionId,
          date: new Date().toISOString(),
          messages: chatHistory,
        });
      }

      setAllChats(updatedAllChats);
      
      // First try to save to API
      if (isOnline) {
        // We'll save individual messages through the sendChatMessage function
        // This will update MongoDB with each message
      }
      
      // Also save to localStorage as backup
      localStorage.setItem(
        "medicalChatHistory",
        JSON.stringify(updatedAllChats)
      );
    }
  }, [chatHistory]);

  // Add logic to send pending messages when connection returns
  useEffect(() => {
    if (isOnline && pendingMessages.length > 0) {
      // Process pending messages
      const processPendingMessages = async () => {
        for (const msg of pendingMessages) {
          try {
            await sendChatMessage(CHAT_ENDPOINT, msg.text, msg.clientId);
            // Update UI to show message sent
            setChatHistory(prev => prev.map(item => 
              item.timestamp === msg.timestamp ? { ...item, pending: false } : item
            ));
          } catch (error) {
            console.error("Failed to send pending message:", error);
          }
        }
        setPendingMessages([]);
      };
      
      processPendingMessages();
    }
  }, [isOnline, pendingMessages]);

  const getResponse = async () => {
    if (!value) {
      setError("გთხოვთ ჩაწეროთ შეკითხვა");
      return;
    }

    if (value.length > MAX_CHARS) {
      setError(`შეკითხვა არ უნდა აღემატებოდეს ${MAX_CHARS} სიმბოლოს`);
      return;
    }

    if (!isOnline) {
      setError("თქვენ არ ხართ ინტერნეტთან დაკავშირებული");
      return;
    }

    setLoading(true);
    setError("");
    setShowLiveCaller(false);

    try {
      // Use the chat service to check for predefined answers first
      const data = await sendChatMessage(CHAT_ENDPOINT, value, sessionId);

      // Add to chat history, marking predefined answers
      setChatHistory((prev) => [
        ...prev,
        { type: "user", message: value, timestamp: new Date().toISOString() },
        {
          type: "bot",
          message: data.text,
          isPredefined: data.isPredefined, // This flag indicates a predefined answer
          timestamp: new Date().toISOString(),
        },
      ]);

      setResponse(data.text);
      setValue("");
    } catch (error) {
      console.error("Error fetching response:", error);
      setError("შეცდომაა, გთხოვთ სცადოთ ხელახლა");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    const messageObj = {
      text: value,
      clientId: sessionId,
      timestamp: new Date().toISOString(),
      pending: !isOnline
    };
    
    if (!isOnline) {
      // Store in pending queue
      setPendingMessages(prev => [...prev, messageObj]);
      
      // Show in UI immediately
      setChatHistory(prev => [
        ...prev,
        { 
          type: "user", 
          message: value, 
          timestamp: messageObj.timestamp,
          pending: true
        }
      ]);
      
      setValue("");
      return;
    }
    
    // Online sending logic...
  };

  const resetChat = () => {
    // Save current chat before clearing if it has messages
    if (chatHistory.length > 0) {
      // The chat is already saved via the useEffect
      setSessionId(`session_${Date.now()}`); // Create new session for next chat
    }

    setChatHistory([]);
    setResponse("");
    setShowChatForm(false);
    setShowLiveChat(false);
    setShowLiveCaller(true);
    setShowChatHistory(false);
  };

  const loadChatSession = (sessionData) => {
    setChatHistory(sessionData.messages);
    setSessionId(sessionData.id);
    setShowChatHistory(false);
    setShowChatForm(true);
    setShowLiveCaller(false);
  };

  const handleStartAiChat = () => {
    setShowChatForm(true);
    setShowLiveCaller(false);
    setShowLiveChat(false);
  };

  const handleStartLiveChat = () => {
    setShowLiveChat(true);
    setShowLiveCaller(false);
    setShowChatForm(false);
  };

  // Add these new functions to handle chat history deletion

  const handleDeleteSession = async (sessionId) => {
    try {
      if (isOnline) {
        // Call API to delete from MongoDB
        await deleteChatSession(sessionId);
      }
      
      // Also remove from local state
      const updatedChats = allChats.filter((chat) => chat.id !== sessionId);
      setAllChats(updatedChats);
      
      // Update localStorage as backup
      localStorage.setItem("medicalChatHistory", JSON.stringify(updatedChats));
      
      // If the deleted session was the current session, reset the chat
      if (sessionId === sessionId) {
        resetChat();
      }
    } catch (error) {
      console.error("Error deleting chat session:", error);
      // Fallback to local delete if API fails
      const updatedChats = allChats.filter((chat) => chat.id !== sessionId);
      setAllChats(updatedChats);
      localStorage.setItem("medicalChatHistory", JSON.stringify(updatedChats));
    }
  };

  const handleClearAllHistory = async () => {
    try {
      if (isOnline) {
        // Call API to clear all history from MongoDB
        await clearChatHistory();
      }
      
      // Clear local state
      setAllChats([]);
      localStorage.removeItem("medicalChatHistory");
      
      // Reset current chat if needed
      resetChat();
    } catch (error) {
      console.error("Error clearing chat history:", error);
      // Fallback to local clear if API fails
      setAllChats([]);
      localStorage.removeItem("medicalChatHistory");
      resetChat();
    }
  };

  return (
    <div className="app">
      {/* Replace the Badge with a custom styled button */}
      <Box
        className={`chat-button-container ${isOnline ? "online" : "offline"}`}
        onClick={() => setIsModalOpen(true)}
      >
        <img src={SmsSvg} alt="SMS Icon" className="sms_svg" />
        <span
          className={`status-indicator ${isOnline ? "online" : "offline"}`}
        ></span>
      </Box>

      {/* Add Operator Login Link */}
      <Box
        sx={{
          position: "fixed",
          bottom: "10px",
          left: "10px",
          opacity: 0.7,
          "&:hover": {
            opacity: 1,
          },
        }}
      >
        <Link
          to="/operator"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Button size="small" variant="text" sx={{ fontSize: "0.7rem" }}>
            Operator Login
          </Button>
        </Link>
      </Box>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          {showLiveChat ? (
            // LiveChat has its own container so it should remain without the extra padding
            <LiveChat onBack={resetChat} />
          ) : (
            // For other content, wrap in modal-inner-content for padding
            <div className={`modal-inner-content ${showChatForm && !showChatHistory ? 'chat-active' : ''}`}>
              <IconButton
                aria-label="close"
                className="close-icon"
                onClick={() => setIsModalOpen(false)}
                sx={{
                  position: 'absolute',
                  right: '16px',  // Increased from 10px
                  top: '16px',    // Increased from 10px
                  color: 'gray',
                  zIndex: 1000,   // Increased z-index significantly
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  width: '32px',  // Fixed width
                  height: '32px', // Fixed height
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    color: 'black',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>

              {/* History button */}
              {allChats.length > 0 && !showChatHistory && !showLiveChat && (
                <div className="history-button-wrapper">
                  <IconButton
                    className="custom-history-button"
                    onClick={() => setShowChatHistory(true)}
                    title="ისტორია"
                    color="primary"
                  >
                    <HistoryIcon />
                  </IconButton>
                </div>
              )}

              {/* LiveCaller widget */}
              {showLiveCaller && !showChatForm && !showChatHistory && (
                <LiveCallerWidget
                  onChatButtonClick={handleStartAiChat}
                  onLiveChatClick={handleStartLiveChat}
                  isOnline={isOnline}
                />
              )}

              {/* Chat History View */}
              {showChatHistory && (
                <ChatHistory
                  chatSessions={allChats}
                  onSelectSession={loadChatSession}
                  onBack={() => setShowChatHistory(false)}
                  onDeleteSession={handleDeleteSession}
                  onClearHistory={handleClearAllHistory}
                />
              )}

              {/* AI Chat Form - Updated to match LiveChat design */}
              {showChatForm && !showChatHistory && (
                <div className="live-chat-container">
                  <Box className="live-chat-header">
                    <IconButton onClick={resetChat} edge="start" aria-label="back">
                      <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6">
                      AI ჩატი
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box className="messages-container">
                    {chatHistory.map((entry, index) => (
                      <Box 
                        key={index} 
                        className={`message ${entry.type === 'user' ? 'self' : 'other'} ${entry.isPredefined ? 'predefined' : ''}`}
                      >
                        {entry.type === 'bot' && (
                          <IconButton className="message-avatar" size="small">
                            {entry.isPredefined ? "DB" : "AI"}
                          </IconButton>
                        )}
                        
                        <Box className="message-bubble">
                          <Typography variant="body1">{entry.message}</Typography>
                          <Typography variant="caption" className="message-time">
                            {new Date(entry.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                            {entry.isPredefined && " • Predefined"}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    
                    {loading && (
                      <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    )}
                    
                    {/* Error display */}
                    {error && (
                      <Box className="message system error">
                        <Box className="message-bubble">
                          <Typography variant="body2">{error}</Typography>
                        </Box>
                      </Box>
                    )}
                    
                    <div className="messages-end-ref" />
                  </Box>
                  
                  <Box 
                    component="form" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      getResponse();
                    }}
                    className="message-input-container"
                  >
                    <InputForm
                      value={value}
                      setValue={setValue}
                      getResponse={getResponse}
                      error={null} // Move error to message display
                      loading={loading}
                      charLimit={MAX_CHARS}
                    />
                  </Box>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

// Wrap the app with LiveChatProvider and BrowserRouter
const App = () => (
  <LiveChatProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/operator" element={<OperatorPanel />} />
        <Route path="/operator/signup" element={<OperatorSignup />} />
        <Route path="/operator/login" element={<OperatorLogin />} />
        <Route path="/" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  </LiveChatProvider>
);

export default App;
