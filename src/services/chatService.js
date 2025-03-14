import { findPredefinedAnswer } from '../data/predefinedAnswers';
import axios from 'axios';

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
  try {
    const response = await axios.post(apiUrl, { message, sessionId });
    return response.data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
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
export const fetchChatHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/chat-sessions`);
    return response.data.map(session => ({
      id: session.sessionId,
      date: session.createdAt || new Date().toISOString(),
      messages: session.messages.map(msg => ({
        type: msg.type,
        message: msg.message,
        timestamp: msg.timestamp,
        isPredefined: msg.isPredefined || false
      }))
    }));
  } catch (error) {
    console.error("Error fetching chat history:", error);
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

// New function to delete a chat session
export const deleteChatSession = async (sessionId) => {
  try {
    await axios.delete(`${API_URL}/api/chat-sessions/${sessionId}`);
    return true;
  } catch (error) {
    console.error("Error deleting chat session:", error);
    throw error;
  }
};

// New function to clear all chat history
export const clearChatHistory = async () => {
  try {
    await axios.delete(`${API_URL}/api/chat-sessions`);
    return true;
  } catch (error) {
    console.error("Error clearing chat history:", error);
    throw error;
  }
};
