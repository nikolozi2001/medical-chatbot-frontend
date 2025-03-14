import React, { useState } from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import PropTypes from 'prop-types';

const FeedbackWidget = ({ onSubmit, sessionId, placement = 'end' }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }
    
    try {
      await onSubmit({
        sessionId,
        rating,
        comment,
        timestamp: new Date().toISOString()
      });
      
      setSubmitted(true);
      setRating(0);
      setComment('');
      setError(null);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      console.error('Feedback submission error:', err);
    }
  };
  
  return (
    <>
      <Box 
        sx={{
          p: 2,
          borderRadius: 1,
          bgcolor: 'background.paper',
          boxShadow: 1,
          width: '100%',
          maxWidth: 400,
          alignSelf: placement === 'end' ? 'flex-end' : 'flex-start',
          mt: 2
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          როგორ შეაფასებთ ჩვენს მომსახურებას?
        </Typography>
        
        <Rating
          value={rating}
          onChange={(_, newValue) => setRating(newValue)}
          size="large"
          sx={{ my: 1 }}
        />
        
        <TextField
          placeholder="დაგვიტოვეთ კომენტარი (არასავალდებულო)"
          fullWidth
          multiline
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mt: 2, mb: 1 }}
        />
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ mt: 1 }}
          fullWidth
          disabled={submitted}
        >
          {submitted ? 'მადლობა!' : 'გაგზავნა'}
        </Button>
      </Box>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

FeedbackWidget.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  sessionId: PropTypes.string.isRequired,
  placement: PropTypes.oneOf(['start', 'end'])
};

export default FeedbackWidget;
