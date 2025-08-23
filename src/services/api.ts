import { parentComm } from './parentCommunication';
import { getPrimaryAppApiUrl } from '../config/environment';

export const callPrimaryAppAPI = async (
  endpoint: string, 
  data?: any, 
  method: string = 'POST'
) => {
  if (!parentComm.isReadyForAPI()) {
    throw new Error('Not ready for API calls - waiting for auth token');
  }

  const token = parentComm.getAuthToken();
  
  try {
    const response = await fetch(getPrimaryAppApiUrl(endpoint), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};
