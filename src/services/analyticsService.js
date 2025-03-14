// Simple analytics service
class AnalyticsService {
  constructor() {
    this.events = [];
    this.isInitialized = false;
  }
  
  init(options = {}) {
    const { userId, disabled = false } = options;
    
    this.userId = userId || 'anonymous';
    this.disabled = disabled;
    this.sessionId = `session_${Date.now()}`;
    this.isInitialized = true;
    
    // Record session start
    this.trackEvent('session_start');
  }
  
  trackEvent(eventName, properties = {}) {
    if (!this.isInitialized || this.disabled) return;
    
    const event = {
      eventName,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      properties,
      userAgent: navigator.userAgent,
      // Include other relevant context
      context: {
        page: window.location.pathname,
        referrer: document.referrer,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      }
    };
    
    this.events.push(event);
    
    // In a real implementation, you would send this to your analytics backend
    this._sendToAnalyticsBackend(event);
    
    // For debugging
    console.debug('Analytics event:', eventName, properties);
  }
  
  _sendToAnalyticsBackend(event) {
    // Implement the actual sending logic here
    // This might be a fetch request to your backend
    
    // For now, just simulate with localStorage
    try {
      const storedEvents = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
      storedEvents.push(event);
      localStorage.setItem('analyticsEvents', JSON.stringify(storedEvents));
    } catch (error) {
      console.error('Failed to store analytics event:', error);
    }
  }
  
  // Get stored events (for debugging)
  getStoredEvents() {
    try {
      return JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
    } catch (error) {
      console.error('Failed to retrieve analytics events:', error);
      return [];
    }
  }
}

export const analytics = new AnalyticsService();
export default analytics;
