import React, { useState } from 'react';
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
  FormControlLabel
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useNavigate } from 'react-router-dom';
import { useLiveChat } from '../context/LiveChatContext';
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
    setCurrentClient 
  } = useLiveChat();
  
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple authentication for demo purposes - in production, use proper auth
    if (password === 'operator123') {
      setIsAuthenticated(true);
      enableOperatorMode();
      setError('');
    } else {
      setError('Invalid password');
    }
  };

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

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ pt: 8 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom textAlign="center">
              Operator Login
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} textAlign="center">
              Enter password to access operator panel
            </Typography>
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!error}
                helperText={error || "Hint: Use 'operator123' to login"}
                fullWidth
                margin="normal"
              />
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2 }}
              >
                Login
              </Button>
              <Button
                variant="text"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </Box>
          </CardContent>
        </Card>
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
          
          {/* Replace Badge with custom status indicator */}
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
          
          <IconButton 
            color="inherit" 
            onClick={() => {
              disableOperatorMode();
              navigate('/');
            }}
          >
            <ExitToAppIcon />
          </IconButton>
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
