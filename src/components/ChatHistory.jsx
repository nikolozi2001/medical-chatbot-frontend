import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  TextField, 
  InputAdornment,
  IconButton,
  Divider
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PropTypes from "prop-types";
import "./ChatHistory.scss";

const ChatHistory = ({ chatSessions, onSelectSession, onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };
  
  const getPreviewText = (messages) => {
    if (!messages || messages.length === 0) return "No messages";
    return messages[0].message.substring(0, 30) + (messages[0].message.length > 30 ? "..." : "");
  };
  
  const filteredSessions = chatSessions.filter(session => {
    if (!searchTerm) return true;
    
    // Search through messages in this session
    return session.messages.some(msg => 
      msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  return (
    <Box className="chat-history-container">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">
          საუბრის ისტორია
        </Typography>
      </Box>
      
      <TextField
        fullWidth
        placeholder="ძებნა..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        margin="normal"
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      <List className="chat-history-list">
        {filteredSessions.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
            ისტორია არ არის
          </Typography>
        ) : (
          filteredSessions.map((session) => (
            <React.Fragment key={session.id}>
              <ListItem 
                button 
                onClick={() => onSelectSession(session)}
                className="chat-history-item"
              >
                <ListItemText 
                  primary={formatDate(session.date)}
                  secondary={getPreviewText(session.messages)}
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))
        )}
      </List>
    </Box>
  );
};

ChatHistory.propTypes = {
  chatSessions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    messages: PropTypes.array.isRequired
  })).isRequired,
  onSelectSession: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};

export default ChatHistory;
