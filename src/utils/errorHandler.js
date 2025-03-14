// Create a dedicated error handler
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  SERVER: 'server',
  VALIDATION: 'validation',
  UNKNOWN: 'unknown'
};

export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
  }
}

export const handleError = (error, options = {}) => {
  const { showToast = true, logToConsole = true } = options;
  
  // Determine error type
  let appError;
  if (error instanceof AppError) {
    appError = error;
  } else if (error.message && error.message.includes('Network Error')) {
    appError = new AppError('Network connection issue', ERROR_TYPES.NETWORK, error);
  } else if (error.response && error.response.status === 401) {
    appError = new AppError('Authentication failed', ERROR_TYPES.AUTHENTICATION, error);
  } else if (error.response && error.response.status >= 500) {
    appError = new AppError('Server error occurred', ERROR_TYPES.SERVER, error);
  } else {
    appError = new AppError('An unexpected error occurred', ERROR_TYPES.UNKNOWN, error);
  }
  
  // Log error
  if (logToConsole) {
    console.error(`[${appError.type.toUpperCase()}]`, appError.message, appError.originalError);
  }
  
  // Show toast notification
  if (showToast) {
    // Implement toast notification
  }
  
  return appError;
};
