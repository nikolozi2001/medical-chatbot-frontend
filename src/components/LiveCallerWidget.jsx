import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, Button, Divider, Alert } from "@mui/material";
import ChatIcon from '@mui/icons-material/Chat';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import "./LiveCallerWidget.scss";

const LiveCallerWidget = ({ onChatButtonClick, onLiveChatClick, isOnline }) => {
  return (
    <Box className="live-caller-widget">
      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
        გსურთ დახმარება?
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
        აირჩიეთ ქვემოთ მოცემული ვარიანტებიდან ერთ-ერთი
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<ChatIcon />}
          onClick={onChatButtonClick}
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
          onClick={onLiveChatClick}
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