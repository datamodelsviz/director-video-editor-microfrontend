// Environment configuration for the React Video Editor Pro
interface EnvironmentConfig {
  // Primary App Configuration
  primaryApp: {
    apiBaseUrl: string;
    uiBaseUrl: string;
    rendersPagePath: string;
  };
  
  // API Endpoints
  api: {
    render: string;
  };
}

// Default configuration
const defaultConfig: EnvironmentConfig = {
  primaryApp: {
    apiBaseUrl: import.meta.env.VITE_PRIMARY_APP_API_URL || 'http://localhost:8000',
    uiBaseUrl: import.meta.env.VITE_PRIMARY_APP_UI_URL || 'http://localhost:3003',
    rendersPagePath: import.meta.env.VITE_RENDERS_PAGE_PATH || '/renders',
  },

  api: {
    render: import.meta.env.VITE_API_RENDER_ENDPOINT || '/api/render',
  },
};

// Helper function to get full URL for primary app API
export const getPrimaryAppApiUrl = (endpoint: string): string => {
  return `${defaultConfig.primaryApp.apiBaseUrl}${endpoint}`;
};

// Helper function to get full URL for primary app UI
export const getPrimaryAppUiUrl = (path: string): string => {
  return `${defaultConfig.primaryApp.uiBaseUrl}${path}`;
};

// Export the configuration
export const config = defaultConfig;

// Export individual values for convenience
export const {
  primaryApp,
  api,
} = defaultConfig;
