import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Paper, 
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { resetPassword, validateResetToken } from '../services/authService';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [isValidating, setIsValidating] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract token from URL
  const query = new URLSearchParams(location.search);
  const token = query.get('token');
  const email = query.get('email');
  
  // Validate token when component mounts
  useEffect(() => {
    const checkToken = async () => {
      if (!token || !email) {
        setIsTokenValid(false);
        setError('Invalid or missing reset token. Please request a new password reset link.');
        setIsValidating(false);
        return;
      }
      
      try {
        await validateResetToken(token, email);
        setIsTokenValid(true);
        setIsValidating(false);
      } catch {
        setIsTokenValid(false);
        setError('This password reset link is invalid or has expired. Please request a new one.');
        setIsValidating(false);
      }
    };
    
    checkToken();
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await resetPassword(token, email, password);
      setSuccessMessage('Your password has been reset successfully!');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/operator/login');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while validating token
  if (isValidating) {
    return (
      <Container maxWidth="sm" sx={{ pt: 8, pb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Validating your reset link...</Typography>
      </Container>
    );
  }

  // Show error if token is invalid
  if (isTokenValid === false) {
    return (
      <Container maxWidth="sm" sx={{ pt: 8, pb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Password Reset Error
          </Typography>
          
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          
          <Button
            component={RouterLink}
            to="/operator/forgot-password"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
          >
            Request New Reset Link
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ pt: 8, pb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Reset Your Password
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="New Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting || !!successMessage}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting || !!successMessage}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting || !password || !confirmPassword || !!successMessage}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;
