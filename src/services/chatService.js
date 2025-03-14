import { findPredefinedAnswer } from '../data/predefinedAnswers';

// Add API_URL constant definition at the top of the file
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Sends a chat message to the API
 * @param {string} apiUrl - The API URL
 * @param {string} message - The message to send
 * @param {string} sessionId - The session ID
 * @returns {Promise} - Promise resolving to the response
 */
export const sendChatMessage = async (apiUrl, message, sessionId) => {
  // First check if we have a predefined answer
  const predefinedAnswer = findPredefinedAnswer(message);
  
  if (predefinedAnswer) {
    // Return the predefined answer without calling the API
    console.log('Using predefined answer for:', message);
    return {
      text: predefinedAnswer,
      isPredefined: true
    };
  }
  
  // Continue with normal API call for non-predefined questions
  const options = {
    method: "POST",
    body: JSON.stringify({
      message,
      sessionId
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
  
  const response = await fetch(apiUrl, options);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  
  return response.json();
};

/**
 * Upload a file to the chat
 * @param {string} apiUrl - The API URL
 * @param {File} file - The file to upload
 * @param {string} sessionId - The session ID
 * @returns {Promise} - Promise resolving to the response
 */
export const uploadFile = async (apiUrl, file, sessionId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sessionId', sessionId);
  
  const response = await fetch(`${apiUrl}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error("Failed to upload file");
  }
  
  return response.json();
};

// Fetch chat history
export const getChatSessions = async () => {
  try {
    const response = await fetch(`${API_URL}/api/chat-sessions`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch chat sessions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    throw error;
  }
};

// Get a specific chat session
export const getChatSessionById = async (sessionId) => {
  try {
    const response = await fetch(`${API_URL}/api/chat-sessions/${sessionId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch chat session');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching chat session:', error);
    throw error;
  }
};

// Submit feedback for a chat session
export const submitFeedback = async (sessionId, feedback) => {
  try {
    const response = await fetch(`${API_URL}/api/chat-sessions/${sessionId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedback)
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};
