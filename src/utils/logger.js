const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Get current log level from environment or default to INFO in production, DEBUG in development
// Using Vite's import.meta.env instead of process.env
const CURRENT_LOG_LEVEL = import.meta.env.PROD 
  ? LOG_LEVELS.INFO 
  : LOG_LEVELS.DEBUG;

// Initialize local storage for logs
const initializeLogStorage = () => {
  if (!localStorage.getItem('appLogs')) {
    localStorage.setItem('appLogs', JSON.stringify([]));
  }
};

// Add log entry to local storage
const storeLog = (level, message, data) => {
  try {
    initializeLogStorage();
    const logs = JSON.parse(localStorage.getItem('appLogs')) || [];
    logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    });
    
    // Keep only latest 100 logs
    while (logs.length > 100) logs.shift();
    
    localStorage.setItem('appLogs', JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to store log:', error);
  }
};

export const logger = {
  debug: (message, data) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.DEBUG) {
      console.debug(`[DEBUG] ${message}`, data);
      storeLog('DEBUG', message, data);
    }
  },
  
  info: (message, data) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.INFO) {
      console.info(`[INFO] ${message}`, data);
      storeLog('INFO', message, data);
    }
  },
  
  warn: (message, data) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, data);
      storeLog('WARN', message, data);
    }
  },
  
  error: (message, data) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, data);
      storeLog('ERROR', message, data);
    }
  },
  
  // Utility to get all logs
  getLogs: () => {
    try {
      initializeLogStorage();
      return JSON.parse(localStorage.getItem('appLogs')) || [];
    } catch (error) {
      console.error('Failed to retrieve logs:', error);
      return [];
    }
  },
  
  // Clear logs
  clearLogs: () => {
    localStorage.setItem('appLogs', JSON.stringify([]));
  }
};
