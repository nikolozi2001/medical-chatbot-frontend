import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Divider, 
  TextField, 
  Button, 
  Paper, 
  AppBar, 
  Toolbar, 
  IconButton,
  Badge,
  Container,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { useLiveChat } from '../context/LiveChatContext';
import { isOperatorLoggedIn, logoutOperator } from '../services/authService';
import './OperatorPanel.scss';

const OperatorPanel = () => {
  const navigate = useNavigate();
  const { 
    isConnected, 
    clients, 
    currentClient, 
    chats,
    enableOperatorMode,
    disableOperatorMode, 
    acceptClient, 
    sendMessage, 
    setCurrentClient,
    soundEnabled,
    setSoundEnabled,
    operatorData
  } = useLiveChat();
  
  const [message, setMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Check if operator is logged in
  useEffect(() => {
    if (!isOperatorLoggedIn()) {
      navigate('/operator/login');
    }
  }, [navigate]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !currentClient) return;
    
    sendMessage(message, currentClient.id);
    setMessage('');
  };

  const handleClientSelect = (client) => {
    setCurrentClient(client);
    acceptClient(client.id);
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutOperator();
    disableOperatorMode();
    navigate('/operator/login');
    handleCloseMenu();
  };

  // If we don't have operator data yet but we're checking login status, show loading
  if (!operatorData && isOperatorLoggedIn()) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading operator panel...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Operator Control Panel
          </Typography>
          
          {/* Sound toggle switch */}
          <FormControlLabel
            control={
              <Switch
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                color="default"
                size="small"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                {soundEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
              </Box>
            }
            sx={{ mr: 2, '.MuiFormControlLabel-label': { display: 'flex' } }}
          />
          
          {/* Status indicator */}
          <Box 
            className={`status-indicator-container ${isConnected ? 'online' : 'offline'}`}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              mr: 2
            }}
          >
            <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
            <Typography variant="body2" sx={{ ml: 1 }}>
              {isConnected ? 'Online' : 'Offline'}
            </Typography>
          </Box>
          
          {/* User menu */}
          <IconButton 
            color="inherit" 
            onClick={handleOpenMenu}
            sx={{ mr: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {operatorData?.displayName?.[0] || operatorData?.username?.[0] || 'O'}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                Signed in as {operatorData?.displayName || operatorData?.username}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ExitToAppIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Clients List */}
        <Paper sx={{ width: 240, overflow: 'auto', borderRadius: 0 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Active Clients
          </Typography>
          <Divider />
          {clients.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No active clients
              </Typography>
            </Box>
          ) : (
            <List>
              {clients.map((client) => (
                <ListItem key={client.id} disablePadding>
                  <ListItemButton
                    selected={currentClient?.id === client.id}
                    onClick={() => handleClientSelect(client)}
                  >
                    <PersonIcon sx={{ mr: 1, color: client.hasOperator ? 'primary.main' : 'text.secondary' }} />
                    <ListItemText 
                      primary={`Client ${client.id.substring(0, 8)}...`}
                      secondary={client.hasOperator ? 'Assigned' : 'Waiting'}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
        
        {/* Chat Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          {currentClient ? (
            <>
              <Typography variant="h6" gutterBottom>
                Chat with Client {currentClient.id.substring(0, 8)}...
              </Typography>
              
              <Box sx={{ 
                flexGrow: 1, 
                bgcolor: '#f5f5f5', 
                borderRadius: 1, 
                p: 2, 
                mb: 2, 
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {chats[currentClient.id]?.length ? (
                  chats[currentClient.id].map((chat) => (
                    <Box 
                      key={chat.id}
                      sx={{ 
                        alignSelf: chat.fromClient ? 'flex-start' : 'flex-end',
                        bgcolor: chat.fromClient ? '#e0e0e0' : '#1976d2',
                        color: chat.fromClient ? 'text.primary' : 'white',
                        borderRadius: 2,
                        py: 1,
                        px: 2,
                        mb: 1,
                        maxWidth: '70%'
                      }}
                    >
                      <Typography variant="body2">{chat.text}</Typography>
                      <Typography variant="caption" sx={{ 
                        display: 'block', 
                        textAlign: 'right',
                        opacity: 0.7,
                        fontSize: '0.7rem'
                      }}>
                        {new Date(chat.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No messages yet
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex' }}>
                <TextField
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  variant="outlined"
                  size="small"
                />
                <Button 
                  type="submit"
                  variant="contained"
                  sx={{ ml: 1 }}
                  disabled={!message.trim()}
                  endIcon={<SendIcon />}
                >
                  Send
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                Select a client to start chatting
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default OperatorPanel;
