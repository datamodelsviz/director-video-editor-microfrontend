import { dispatch } from '@designcombo/events';
import { CommandLogger } from './CommandLogger';

export const dispatchWithLogging = (
  action: string, 
  payload: any, 
  options?: any,
  source: 'ui' | 'api' | 'cli' = 'ui',
  component?: string
) => {
  const logger = CommandLogger.getInstance();
  
  try {
    // Execute existing dispatch (no change to existing logic)
    dispatch(action, { payload, options });
    
    // Log the action
    logger.log(action, payload, { success: true, options }, source, component);
    
  } catch (error) {
    // Log the error
    logger.log(action, payload, { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      options 
    }, source, component);
    
    // Re-throw to maintain existing error handling
    throw error;
  }
};

// Convenience functions for common actions
export const logAddVideo = (payload: any, options?: any, component?: string) => {
  dispatchWithLogging('ADD_VIDEO', payload, options, 'ui', component);
};

export const logAddImage = (payload: any, options?: any, component?: string) => {
  dispatchWithLogging('ADD_IMAGE', payload, options, 'ui', component);
};

export const logAddAudio = (payload: any, options?: any, component?: string) => {
  dispatchWithLogging('ADD_AUDIO', payload, options, 'ui', component);
};

export const logEditObject = (payload: any, options?: any, component?: string) => {
  dispatchWithLogging('EDIT_OBJECT', payload, options, 'ui', component);
};

export const logDeleteObject = (payload: any, options?: any, component?: string) => {
  dispatchWithLogging('DELETE_OBJECT', payload, options, 'ui', component);
};

// Export the logger instance for direct access if needed
export const commandLogger = CommandLogger.getInstance();
