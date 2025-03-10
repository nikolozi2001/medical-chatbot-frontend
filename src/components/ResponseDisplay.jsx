import React from "react";
import { Typography, Box, Link, Paper, IconButton } from "@mui/material";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import GetAppIcon from '@mui/icons-material/GetApp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import PropTypes from "prop-types";
import "./ResponseDisplay.scss";

const ResponseDisplay = ({ response, chatHistory = [] }) => {
  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image')) return <ImageIcon />;
    if (fileType?.includes('pdf')) return <PictureAsPdfIcon />;
    return <InsertDriveFileIcon />;
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // If we have chat history, display that instead of just the response
  if (chatHistory.length > 0) {
    return (
      <Box 
        sx={{ 
          mt: 2, 
          maxHeight: "300px", 
          overflow: "auto",
          width: "100%"
        }} 
        className="response-display-container"
      >
        {chatHistory.map((entry, index) => (
          <div 
            key={index} 
            className={entry.type === 'user' ? 'user-message' : 'bot-message'} 
            style={{ 
              marginLeft: entry.type === 'user' ? 'auto' : '8px', 
              maxWidth: '75%'
            }}
          >
            {entry.fileUrl ? (
              // File message
              <Paper elevation={0} className="file-message">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getFileIcon(entry.fileType)}
                  <Typography variant="body2" className="file-name">
                    {entry.fileName}
                  </Typography>
                  <IconButton 
                    size="small" 
                    component={Link} 
                    href={entry.fileUrl} 
                    target="_blank" 
                    download
                  >
                    <GetAppIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ) : (
              // Text message
              <>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    wordBreak: "break-word",
                    overflowWrap: "break-word"
                  }}
                >
                  {entry.message}
                </Typography>
                <Typography variant="caption" className="message-timestamp">
                  {formatTime(entry.timestamp)}
                </Typography>
              </>
            )}
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