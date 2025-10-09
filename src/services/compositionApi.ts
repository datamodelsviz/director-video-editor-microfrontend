import { parentComm } from './parentCommunication';
import { config } from '../config/environment';

// Basic API Response Types
export interface CompositionApiResponse {
  success: boolean;
  data: {
    compositions?: Composition[];
    composition?: Composition;
    pagination?: PaginationInfo;
  };
  meta: {
    request_id: string;
    timestamp: string;
  };
}

export interface Composition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  duration: number;
  fps: number;
  size: {
    width: number;
    height: number;
  };
  tracks_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_public: boolean;
  category: string;
  tags: string[];
  design: CompositionDesign;
  options: CompositionOptions;
}

export interface CompositionDesign {
  id: string;
  size: {
    width: number;
    height: number;
  };
  fps: number;
  tracks: Track[];
  trackItemIds: string[];
  trackItemsMap: Record<string, TrackItem>;
  transitionIds: string[];
  transitionsMap: Record<string, any>;
  scale: {
    index: number;
    unit: number;
    zoom: number;
    segments: number;
  };
  duration: number;
  activeIds: string[];
  structure: any[];
  background: {
    type: 'color' | 'image';
    value: string;
  };
}

export interface Track {
  id: string;
  accepts: string[];
  type: string;
  items: string[];
  magnetic: boolean;
  static: boolean;
}

export interface TrackItem {
  id: string;
  type: string;
  name: string;
  details: {
    src: string;
    width: number;
    height: number;
    opacity: number;
    volume: number;
  };
  display: {
    from: number;
    to: number;
  };
  isMain: boolean;
}

export interface CompositionOptions {
  fps: number;
  size: {
    width: number;
    height: number;
  };
  format: string;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CreateCompositionData {
  name: string;
  description: string;
  thumbnail?: string;
  duration: number;
  fps: number;
  size: {
    width: number;
    height: number;
  };
  tracks_count: number;
  is_public?: boolean;
  category?: string;
  tags?: string[];
  design: CompositionDesign;
  options: CompositionOptions;
}

class CompositionApiService {
  private baseUrl: string;

  constructor() {
    const apiBase = (config.primaryApp.apiBaseUrl || '').replace(/\/+$/, '');
    this.baseUrl = apiBase.endsWith('/api') ? `${apiBase}/v1` : `${apiBase}/api/v1`;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    if (!parentComm.isReadyForAPI()) {
      throw new Error('Not ready for API calls - waiting for auth token');
    }

    const token = parentComm.getAuthToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail?.error?.message || 
          `API call failed: ${response.status} ${response.statusText}`
        );
      }

      if (method === 'DELETE' && response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('Composition API error:', error);
      throw error;
    }
  }

  // List compositions (recent 10)
  async listCompositions(): Promise<CompositionApiResponse> {
    const endpoint = '/compositions?limit=10&sort=updated_at&order=desc';
    return this.makeRequest<CompositionApiResponse>(endpoint);
  }

  // Get composition details
  async getComposition(compositionId: string): Promise<CompositionApiResponse> {
    const endpoint = `/compositions/${compositionId}`;
    console.log('CompositionApi: getComposition called with ID:', compositionId);
    console.log('CompositionApi: Full endpoint:', `${this.baseUrl}${endpoint}`);
    console.log('CompositionApi: API readiness:', parentComm.isReadyForAPI());
    console.log('CompositionApi: Auth token available:', !!parentComm.getAuthToken());
    
    try {
      const result = await this.makeRequest<CompositionApiResponse>(endpoint);
      console.log('CompositionApi: Request successful, result:', result);
      return result;
    } catch (error) {
      console.error('CompositionApi: Request failed:', error);
      throw error;
    }
  }

  // Create new composition
  async createComposition(data: CreateCompositionData): Promise<CompositionApiResponse> {
    return this.makeRequest<CompositionApiResponse>('/compositions', 'POST', data);
  }

  // Update existing composition
  async updateComposition(compositionId: string, data: CreateCompositionData): Promise<CompositionApiResponse> {
    return this.makeRequest<CompositionApiResponse>(`/compositions/${compositionId}`, 'PUT', data);
  }
}

export const compositionApi = new CompositionApiService();
