import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types'; // Add this import
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Avatar, 
  CircularProgress,
  IconButton,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLiveChat } from '../context/LiveChatContext';
import './LiveChat.scss';

const LiveChat = ({ onBack }) => {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [hasRequestedChat, setHasRequestedChat] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { 
    isConnected, 
    agentStatus, 
    liveChatHistory, 
    isWaiting, 
    activeChat, 
    queuePosition,
    requestLiveChat, 
    sendMessage, 
    endChat 
  } = useLiveChat();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveChatHistory]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleStartChat = () => {
    if (name.trim()) {
      requestLiveChat({ name });
      setHasRequestedChat(true);
    }
  };

  const handleEndChat = () => {
    endChat();
    onBack();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Show request form if not requested yet
  if (!hasRequestedChat) {
    return (
      <Box className="live-chat-container">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={onBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            ოპერატორთან დაკავშირება
          </Typography>
        </Box>
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          გთხოვთ შეიყვანოთ თქვენი სახელი ოპერატორთან დასაკავშირებლად
        </Typography>
        
        <TextField
          fullWidth
          label="სახელი"
          variant="outlined"
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        
        <Button 
          variant="contained" 
          fullWidth 
          sx={{ mt: 2 }}
          onClick={handleStartChat}
          disabled={!name.trim()}
        >
          დაკავშირება
        </Button>
      </Box>
    );
  }

  // Show waiting screen
  if (isWaiting) {
    return (
      <Box className="live-chat-container waiting">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography variant="h6">გთხოვთ მოითმინოთ...</Typography>
          <Typography variant="body2">
            {queuePosition > 0 
              ? `თქვენ ხართ ${queuePosition} რიგში` 
              : 'ოპერატორი მალე გიპასუხებთ'}
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<CallEndIcon />}
            onClick={handleEndChat}
          >
            გაუქმება
          </Button>
        </Box>
      </Box>
    );
  }

  // Show active chat
  return (
    <Box className="live-chat-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          ოპერატორთან ჩეთი
        </Typography>
        <Button 
          variant="outlined" 
          color="error" 
          size="small"
          startIcon={<CallEndIcon />}
          onClick={handleEndChat}
        >
          დასრულება
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box className="live-chat-messages">
        {liveChatHistory.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', my: 4 }}>
            მიესალმეთ ოპერატორს და დასვით თქვენი შეკითხვა
          </Typography>
        ) : (
          liveChatHistory.map((msg, index) => (
            <Box
              key={index}
              className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'agent-message'}`}
            >
              {msg.sender !== 'user' && (
                <Avatar 
                  sx={{ width: 32, height: 32, mr: 1 }}
                  alt="Agent"
                >
                  O
                </Avatar>
              )}
              <Paper 
                elevation={0} 
                className={`message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'agent-bubble'}`}
              >
                <Typography variant="body2">{msg.text}</Typography>
                <Typography variant="caption" className="time-stamp">
                  {formatTime(msg.timestamp)}
                </Typography>
              </Paper>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      <Box 
        component="form" 
        onSubmit={handleSendMessage}
        sx={{ 
          display: 'flex', 
          gap: 1, 
          mt: 2,
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'white',
          pt: 2
        }}
      >
        <TextField
          fullWidth
          placeholder="დაწერეთ შეტყობინება..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Button 
          type="submit"
          variant="contained" 
          disableElevation
          disabled={!message.trim()}
        >
          <SendIcon />
        </Button>
      </Box>
    </Box>
  );
};

LiveChat.propTypes = {
  onBack: PropTypes.func.isRequired
};

export default LiveChat;
