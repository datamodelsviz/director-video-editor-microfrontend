import { config } from '../config/environment';

class ParentCommunication {
  private authToken: string | null = null;
  private isReady = false;
  private isInIframe = false;

  constructor() {
    // Check if we're running inside an iframe
    this.isInIframe = window.self !== window.top;
    
    if (this.isInIframe) {
      console.log('[ParentComm] Running inside iframe, setting up communication');
      this.setupMessageListener();
      this.requestAuthToken();
    } else {
      console.log('[ParentComm] Running standalone, no parent communication needed');
      // When running standalone, we're already "ready" but without a token
      // The app can still work without parent communication
    }
  }

  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Validate origin - accept messages from parent app
      if (event.origin !== config.primaryApp.uiBaseUrl) {
        console.log('[ParentComm] Rejected message from origin:', event.origin, 'Expected:', config.primaryApp.uiBaseUrl);
        return;
      }
      
      console.log('[ParentComm] Received message:', event.data);
      
      if (event.data.type === 'HERE_IS_TOKEN') {
        this.authToken = event.data.token;
        this.isReady = true;
        console.log('[ParentComm] Auth token received from parent');
      }
    });
  }

  private requestAuthToken() {
    if (!this.isInIframe) {
      console.log('[ParentComm] Not in iframe, skipping token request');
      return;
    }
    
    try {
      console.log('[ParentComm] Requesting auth token from parent at:', config.primaryApp.uiBaseUrl);
      window.parent.postMessage({
        type: 'NEED_AUTH_TOKEN'
      }, config.primaryApp.uiBaseUrl);
    } catch (error) {
      console.error('[ParentComm] Error sending message to parent:', error);
    }
  }

  isReadyForAPI(): boolean {
    if (!this.isInIframe) {
      // When running standalone, allow API calls (they may fail if auth is required)
      return true;
    }
    return this.isReady && !!this.authToken;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  isRunningInIframe(): boolean {
    return this.isInIframe;
  }
}

export const parentComm = new ParentCommunication();
