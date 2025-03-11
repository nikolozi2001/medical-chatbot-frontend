import { findPredefinedAnswer } from '../data/predefinedAnswers';

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
