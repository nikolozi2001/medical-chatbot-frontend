import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Paper,
  Divider,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CallEndIcon from '@mui/icons-material/CallEnd';
import './OperatorChat.scss';

const OperatorChat = ({ chat, onSendMessage, onEndChat }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSendMessage(message);
    setMessage('');
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Box className="operator-chat-container">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {chat.user?.name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="h6">
            {chat.user?.name || 'მომხმარებელი'}
          </Typography>
        </Box>
        
        <Button 
          variant="outlined"
          color="error"
          startIcon={<CallEndIcon />}
          onClick={onEndChat}
          size="small"
        >
          საუბრის დასრულება
        </Button>
      </Box>
      
      <Box className="messages-container">
        {!chat.messages || chat.messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="body1" color="text.secondary">
              ეს საუბარი ახალია. მიესალმეთ მომხმარებელს!
            </Typography>
          </Box>
        ) : (
          chat.messages.map((msg, index) => (
            <Box 
              key={index} 
              className={`message-wrapper ${msg.sender === 'operator' ? 'operator-message' : 'user-message'}`}
            >
              {msg.sender !== 'operator' && (
                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                  {chat.user?.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
              )}
              <Paper 
                elevation={0}
                className={`message-bubble ${msg.sender === 'operator' ? 'operator-bubble' : 'user-bubble'}`}
              >
                <Typography variant="body1">{msg.text}</Typography>
                <Typography variant="caption" className="timestamp">
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
        className="message-input-container"
      >
        <TextField
          fullWidth
          placeholder="დაწერეთ შეტყობინება..."
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          size="medium"
        />
        <IconButton 
          color="primary" 
          type="submit"
          disabled={!message.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

OperatorChat.propTypes = {
  chat: PropTypes.shape({
    id: PropTypes.string.isRequired,
    user: PropTypes.shape({
      name: PropTypes.string
    }),
    startTime: PropTypes.string,
    messages: PropTypes.array
  }).isRequired,
  onSendMessage: PropTypes.func.isRequired,
  onEndChat: PropTypes.func.isRequired
};

export default OperatorChat;
