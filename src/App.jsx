/* eslint-disable no-unused-vars */
import { useState } from "react";
import InputForm from "./components/InputForm";
import ResponseDisplay from "./components/ResponseDisplay";
import Modal from "./components/Modal";
import SmsSvg from "./assets/icons/sms.svg";
import LiveCallerWidget from "./components/LiveCallerWidget";
import { Typography, Button, CircularProgress, Box, IconButton } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import './App.css';

// Use environment variable or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/chat";

const App = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // Store chat history
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLiveCaller, setShowLiveCaller] = useState(true);
  const [showChatForm, setShowChatForm] = useState(false);
  
  const MAX_CHARS = 500; // Maximum character limit

  const getResponse = async () => {
    if (!value) {
      setError("გთხოვთ ჩაწეროთ შეკითხვა");
      return;
    }
    
    if (value.length > MAX_CHARS) {
      setError(`შეკითხვა არ უნდა აღემატებოდეს ${MAX_CHARS} სიმბოლოს`);
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
        { type: 'user', message: value },
        { type: 'bot', message: data.text }
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
    setChatHistory([]);
    setResponse("");
    setShowChatForm(false);
    setShowLiveCaller(true);
  };

  return (
    <div className="app">
      <img
        onClick={() => setIsModalOpen(true)}
        src={SmsSvg}
        alt="SMS Icon"
        className="sms_svg"
      />
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <IconButton 
            aria-label="close"
            className="close-icon"
            onClick={() => setIsModalOpen(false)}
            sx={{ position: 'absolute', top: 10, right: 10 }}
          >
            <CloseIcon />
          </IconButton>
          
          {!showChatForm && (
            <LiveCallerWidget onChatButtonClick={() => setShowChatForm(true)} />
          )}
          {showChatForm && (
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
          {loading && 
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          }
          <ResponseDisplay response={response} chatHistory={chatHistory} />
        </Modal>
      )}
    </div>
  );
};

export default App;
