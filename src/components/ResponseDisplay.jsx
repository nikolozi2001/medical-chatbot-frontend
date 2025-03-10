import React from "react";
import { Typography, Box } from "@mui/material";
import PropTypes from "prop-types";
import "./ResponseDisplay.scss";

const ResponseDisplay = ({ response, chatHistory = [] }) => {
  // If we have chat history, display that instead of just the response
  if (chatHistory.length > 0) {
    return (
      <Box 
        sx={{ 
          mt: 2, 
          maxHeight: "300px", 
          overflow: "auto",
          width: "100%"  // Ensure it doesn't exceed parent width
        }} 
        className="response-display-container"
      >
        {chatHistory.map((entry, index) => (
          <div 
            key={index} 
            className={entry.type === 'user' ? 'user-message' : 'bot-message'} 
            style={{ 
              marginLeft: entry.type === 'user' ? 'auto' : '8px', 
              maxWidth: '75%'  // Reduced from 80%
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                wordBreak: "break-word",  // Ensure long words don't cause overflow
                overflowWrap: "break-word"
              }}
            >
              {entry.message}
            </Typography>
          </div>
        ))}
      </Box>
    );
  }

  // Fallback to original behavior if no chat history
  if (!response) return null;

  return (
    <Typography 
      variant="body1" 
      sx={{ 
        mt: 2, 
        p: 2,
        wordBreak: "break-word",
        overflowWrap: "break-word" 
      }}
    >
      {response}
    </Typography>
  );
};

ResponseDisplay.propTypes = {
  response: PropTypes.string,
  chatHistory: PropTypes.array
};

export default ResponseDisplay;