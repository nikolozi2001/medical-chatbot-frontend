/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import InputForm from "./components/InputForm";
import ResponseDisplay from "./components/ResponseDisplay";
import Modal from "./components/Modal";
import SmsSvg from "./assets/icons/sms.svg";
import LiveCallerWidget from "./components/LiveCallerWidget";
import ChatHistory from "./components/ChatHistory";
import LiveChat from "./components/LiveChat";
import OperatorPanel from "./pages/OperatorPanel";
import { LiveChatProvider } from "./context/LiveChatContext";
import { Typography, Button, CircularProgress, Box, IconButton, Badge } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import './App.css';

// Use environment variable or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/chat";

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
  
  const MAX_CHARS = 500; // Maximum character limit

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedChats = localStorage.getItem('medicalChatHistory');
    if (savedChats) {
      setAllChats(JSON.parse(savedChats));
    }
    
    // Set up online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Generate a session ID for this conversation
    setSessionId(`session_${Date.now()}`);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      const updatedAllChats = [...allChats];
      const existingSessionIndex = updatedAllChats.findIndex(chat => chat.id === sessionId);
      
      if (existingSessionIndex >= 0) {
        updatedAllChats[existingSessionIndex].messages = chatHistory;
      } else {
        updatedAllChats.push({
          id: sessionId,
          date: new Date().toISOString(),
          messages: chatHistory
        });
      }
      
      setAllChats(updatedAllChats);
      localStorage.setItem('medicalChatHistory', JSON.stringify(updatedAllChats));
    }
  }, [chatHistory]);

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
      const options = {
        method: "POST",
        body: JSON.stringify({
          message: value,
          sessionId: sessionId
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };
      
      const response = await fetch(API_URL, options);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      const data = await response.json();
      console.log(data);
      
      // Add to chat history
      setChatHistory(prev => [...prev, 
        { type: 'user', message: value, timestamp: new Date().toISOString() },
        { type: 'bot', message: data.text, timestamp: new Date().toISOString() }
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
  
  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      
      const data = await response.json();
      
      // Add file to chat history
      setChatHistory(prev => [...prev, 
        { 
          type: 'user', 
          message: `Sent a file: ${file.name}`, 
          fileUrl: data.fileUrl,
          fileName: file.name,
          fileType: file.type,
          timestamp: new Date().toISOString()
        }
      ]);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("ფაილის ატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="app">
      <Badge 
        color={isOnline ? "success" : "error"}
        variant="dot"
        overlap="circular"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <img
          onClick={() => setIsModalOpen(true)}
          src={SmsSvg}
          alt="SMS Icon"
          className="sms_svg"
        />
      </Badge>
      
      {/* Add Operator Login Link */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: '10px', 
          left: '10px',
          opacity: 0.7,
          '&:hover': {
            opacity: 1
          }
        }}
      >
        <Link to="/operator" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Button 
            size="small" 
            variant="text" 
            sx={{ fontSize: '0.7rem' }}
          >
            Operator Login
          </Button>
        </Link>
      </Box>
      
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <Box sx={{ position: 'relative', height: '100%' }}>
            <IconButton 
              aria-label="close"
              className="close-icon"
              onClick={() => setIsModalOpen(false)}
              sx={{ position: 'absolute', top: 10, right: 10 }}
            >
              <CloseIcon />
            </IconButton>
            
            {/* Online status indicator */}
            <div className="connection-status">
              <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
              <Typography variant="caption">
                {isOnline ? 'დაკავშირებულია' : 'არ არის დაკავშირებული'}
              </Typography>
            </div>
            
            {/* History button */}
            {allChats.length > 0 && !showChatHistory && !showLiveChat && (
              <IconButton 
                className="history-button"
                onClick={() => setShowChatHistory(true)}
                title="ისტორია"
                sx={{ position: 'absolute', top: 10, right: 50 }}
              >
                <HistoryIcon />
              </IconButton>
            )}

            {/* LiveCaller widget */}
            {showLiveCaller && !showChatForm && !showChatHistory && !showLiveChat && (
              <LiveCallerWidget 
                onChatButtonClick={handleStartAiChat} 
                onLiveChatClick={handleStartLiveChat}
                isOnline={isOnline}
              />
            )}
            
            {/* Live Chat with operator */}
            {showLiveChat && (
              <LiveChat onBack={resetChat} />
            )}
            
            {/* Chat History View */}
            {showChatHistory && (
              <ChatHistory 
                chatSessions={allChats} 
                onSelectSession={loadChatSession} 
                onBack={() => setShowChatHistory(false)}
              />
            )}
            
            {/* Chat Form */}
            {showChatForm && !showChatHistory && (
              <div className="chat-section">
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  რისი ცოდნა გსურთ?
                </Typography>
                <InputForm
                  value={value}
                  setValue={setValue}
                  getResponse={getResponse}
                  error={error}
                  loading={loading}
                  charLimit={MAX_CHARS}
                  onFileUpload={handleFileUpload}
                />
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={resetChat}
                  startIcon={<ArrowBackIcon />}
                  sx={{ mt: 2 }}
                  size="small"
                >
                  დაბრუნება
                </Button>
              </div>
            )}
            
            {error && <p className="error">{error}</p>}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            
            {/* Only show response display when in chat form and not in history view */}
            {showChatForm && !showChatHistory && (
              <ResponseDisplay response={response} chatHistory={chatHistory} />
            )}
          </Box>
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
        <Route path="/" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  </LiveChatProvider>
);

export default App;
