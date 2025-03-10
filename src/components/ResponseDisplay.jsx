import React from "react";
import { Typography, Box } from "@mui/material";
import PropTypes from "prop-types";
import "./ResponseDisplay.scss";

const ResponseDisplay = ({ response, chatHistory = [] }) => {
  // If we have chat history, display that instead of just the response
  if (chatHistory.length > 0) {
    return (
      <Box sx={{ mt: 2, maxHeight: "300px", overflow: "auto" }} className="response-display-container">
        {chatHistory.map((entry, index) => (
          <div 
            key={index} 
            className={entry.type === 'user' ? 'user-message' : 'bot-message'} 
            style={{ marginLeft: entry.type === 'user' ? 'auto' : '8px', maxWidth: '80%' }}
          >
            <Typography variant="body1">
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
    <Typography variant="body1" sx={{ mt: 2, p: 2 }}>
      {response}
    </Typography>
  );
};

ResponseDisplay.propTypes = {
  response: PropTypes.string,
  chatHistory: PropTypes.array
};

export default ResponseDisplay;