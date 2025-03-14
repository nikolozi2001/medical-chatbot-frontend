import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Button, Divider, Alert, Link, TextField } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ChatIcon from '@mui/icons-material/Chat';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import "./LiveCallerWidget.scss";

const LiveCallerWidget = ({ onChatButtonClick, onLiveChatClick, isOnline }) => {
  const [clientName, setClientName] = useState("");
  
  const handleStartAiChat = () => {
    onChatButtonClick(clientName);
  };
  
  const handleStartLiveChat = () => {
    onLiveChatClick(clientName);
  };

  return (
    <Box className="live-caller-widget">
      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'left' }}>
        გსურთ დახმარება?
      </Typography>
      
      <TextField
        fullWidth
        label="თქვენი სახელი (არასავალდებულო)"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        margin="normal"
        sx={{ mb: 3 }}
      />
      
      <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
        აირჩიეთ ქვემოთ მოცემული ვარიანტებიდან ერთ-ერთი
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<ChatIcon />}
          onClick={handleStartAiChat}
          fullWidth
        >
          კითხვების დასმა AI-სთან
        </Button>

        <Divider sx={{ my: 1 }}>
          <Typography variant="caption" color="textSecondary">ან</Typography>
        </Divider>
        
        <Button
          variant="outlined"
          color="primary"
          size="large"
          startIcon={<SupportAgentIcon />}
          onClick={handleStartLiveChat}
          fullWidth
          disabled={!isOnline}
        >
          ოპერატორთან დაკავშირება
        </Button>
        
        {!isOnline && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              ოპერატორი ამჟამად მიუწვდომელია. გაუშვით ბექენდი ბრძანებით "npm run start:backend"
            </Typography>
          </Alert>
        )}
        
        {/* Add operator links */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Typography variant="caption" color="textSecondary">
            Operators:
          </Typography>
          <Link component={RouterLink} to="/operator/login" underline="hover">
            <Typography variant="caption">Login</Typography>
          </Link>
          <Typography variant="caption" color="textSecondary">•</Typography>
          <Link component={RouterLink} to="/operator/signup" underline="hover">
            <Typography variant="caption">Sign Up</Typography>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

LiveCallerWidget.propTypes = {
  onChatButtonClick: PropTypes.func.isRequired,
  onLiveChatClick: PropTypes.func.isRequired,
  isOnline: PropTypes.bool
};

LiveCallerWidget.defaultProps = {
  isOnline: true
};

export default LiveCallerWidget;