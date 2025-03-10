import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  Divider, 
  Badge,
  Avatar,
  Grid,
  AppBar,
  Toolbar,
  Container
} from '@mui/material';
import io from 'socket.io-client';
import OperatorChat from '../components/OperatorChat';
import '../styles/OperatorPanel.scss';

// Use environment variable or fallback
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

const OperatorPanel = () => {
  const [socket, setSocket] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [operatorName, setOperatorName] = useState('');
  const [password, setPassword] = useState('');
  const [pendingChats, setPendingChats] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loginError, setLoginError] = useState('');
  
  // Connect to socket when component mounts
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
    });
    
    setSocket(newSocket);
    
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);
  
  // Set up event listeners after login
  useEffect(() => {
    if (socket && isLoggedIn) {
      socket.connect();
      
      socket.on('connect', () => {
        console.log('Operator connected to socket');
        // Register as operator
        socket.emit('operator_online', { name: operatorName });
      });
      
      socket.on('pending_chats', (chats) => {
        setPendingChats(chats);
      });
      
      socket.on('active_chats', (chats) => {
        setActiveChats(chats);
      });
      
      socket.on('new_chat_request', (chat) => {
        setPendingChats(prev => [...prev, chat]);
      });
      
      socket.on('chat_message', (message) => {
        setActiveChats(prev => {
          return prev.map(chat => {
            if (chat.id === message.chatId) {
              return {
                ...chat,
                messages: [...(chat.messages || []), message]
              };
            }
            return chat;
          });
        });
        
        // Update selected chat if it's the current one
        if (selectedChat?.id === message.chatId) {
          setSelectedChat(prev => ({
            ...prev,
            messages: [...(prev.messages || []), message]
          }));
        }
      });
      
      socket.on('chat_ended', (chatId) => {
        setActiveChats(prev => prev.filter(chat => chat.id !== chatId));
        if (selectedChat?.id === chatId) {
          setSelectedChat(null);
        }
      });
      
      return () => {
        socket.off('pending_chats');
        socket.off('active_chats');
        socket.off('new_chat_request');
        socket.off('chat_message');
        socket.off('chat_ended');
      };
    }
  }, [socket, isLoggedIn, operatorName, selectedChat]);
  
  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple authentication - in real app, this would be a backend call
    if (operatorName && password === 'operator123') { // Very simple password for demo
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('არასწორი მონაცემები');
    }
  };
  
  const acceptChat = (chat) => {
    if (socket) {
      socket.emit('accept_chat', { chatId: chat.id, operatorName });
      setPendingChats(prev => prev.filter(c => c.id !== chat.id));
      setActiveChats(prev => [...prev, { ...chat, operator: operatorName }]);
    }
  };
  
  const selectChat = (chat) => {
    setSelectedChat(chat);
  };
  
  const sendMessage = (message) => {
    if (socket && selectedChat) {
      const messageData = {
        chatId: selectedChat.id,
        sender: 'operator',
        text: message,
        timestamp: new Date().toISOString(),
      };
      
      socket.emit('operator_message', messageData);
      
      // Update UI optimistically
      setActiveChats(prev => {
        return prev.map(chat => {
          if (chat.id === selectedChat.id) {
            return {
              ...chat,
              messages: [...(chat.messages || []), messageData]
            };
          }
          return chat;
        });
      });
      
      setSelectedChat(prev => ({
        ...prev,
        messages: [...(prev.messages || []), messageData]
      }));
    }
  };
  
  const endChat = () => {
    if (socket && selectedChat) {
      socket.emit('operator_end_chat', { chatId: selectedChat.id });
      setActiveChats(prev => prev.filter(chat => chat.id !== selectedChat.id));
      setSelectedChat(null);
    }
  };
  
  // Show login form if not logged in
  if (!isLoggedIn) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            ოპერატორის პანელი
          </Typography>
          
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="ოპერატორის სახელი"
              margin="normal"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              required
            />
            
            <TextField
              fullWidth
              label="პაროლი"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={!!loginError}
              helperText={loginError}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              შესვლა
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ოპერატორის პანელი
          </Typography>
          <Typography variant="subtitle1">
            მოგესალმებით, {operatorName}
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => setIsLoggedIn(false)}
            sx={{ ml: 2 }}
          >
            გასვლა
          </Button>
        </Toolbar>
      </AppBar>
      
      <Grid container sx={{ height: 'calc(100vh - 64px)' }}>
        <Grid item xs={3} sx={{ borderRight: 1, borderColor: 'divider' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              მომლოდინე მომხმარებლები
            </Typography>
            
            <List>
              {pendingChats.length === 0 ? (
                <ListItem>
                  <ListItemText primary="მოლოდინში არავინ არის" />
                </ListItem>
              ) : (
                pendingChats.map((chat) => (
                  <ListItem key={chat.id} sx={{ mb: 1 }}>
                    <Paper elevation={2} sx={{ p: 2, width: '100%' }}>
                      <Typography variant="subtitle1">
                        {chat.user?.name || 'მომხმარებელი'}
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => acceptChat(chat)}
                        sx={{ mt: 1 }}
                      >
                        მიღება
                      </Button>
                    </Paper>
                  </ListItem>
                ))
              )}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              აქტიური საუბრები
            </Typography>
            
            <List>
              {activeChats.length === 0 ? (
                <ListItem>
                  <ListItemText primary="აქტიური საუბარი არ არის" />
                </ListItem>
              ) : (
                activeChats.map((chat) => (
                  <ListItem 
                    key={chat.id}
                    button
                    selected={selectedChat?.id === chat.id}
                    onClick={() => selectChat(chat)}
                    sx={{ 
                      mb: 1,
                      bgcolor: selectedChat?.id === chat.id ? 'action.selected' : 'transparent',
                      borderRadius: 1
                    }}
                  >
                    <ListItemText 
                      primary={chat.user?.name || 'მომხმარებელი'} 
                      secondary={`დაიწყო: ${new Date(chat.startTime).toLocaleTimeString()}`} 
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        </Grid>
        
        <Grid item xs={9}>
          {selectedChat ? (
            <OperatorChat 
              chat={selectedChat}
              onSendMessage={sendMessage}
              onEndChat={endChat}
            />
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%' 
            }}>
              <Typography variant="h6" color="text.secondary">
                აირჩიეთ საუბარი მარცხენა პანელიდან
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default OperatorPanel;
