/**
 * API Service for communicating with the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
}

interface CreateActivityResponse extends ApiResponse {
  activity_id?: string;
  key?: string;
  prizes?: Array<{
    name: string;
    count: number;
    wid: number;
  }>;
  merkle_root?: string;
}

interface ActivityStatusResponse extends ApiResponse {
  activity_id?: string;
  activity_status?: string;
}

interface ActivityListResponse extends ApiResponse {
  activities?: ActivityListItem[];
}

interface ActivityItemsResponse extends ApiResponse {
  items?: ActivityItem[];
}

interface ActivityItemResponse extends ApiResponse {
  sid?: string;
  r_i?: string;
  win_i?: number;
  leaf?: string;
  proof?: Array<{
    position: 'left' | 'right';
    data: string;
  }> | null;
}

interface RevealResponse extends ApiResponse {
  key?: string;
}

interface ActivityData {
  name: string;
  total_items: number;
  prizes: Array<{
    name: string;
    count: number;
  }>;
}

interface ActivityListItem {
  activity_id: string;
  name: string;
  total_items: number;
  status: string;
  prizes: Array<{
    name: string;
    count: number;
    wid: number;
  }>;
}

interface ActivityItem {
  sid: string;
  r_i?: string;
  win_i?: number;
  leaf: string;
  proof: Array<{
    position: 'left' | 'right';
    data: string;
  }> | null;
  encrypted_data: string;
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T extends ApiResponse>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Add proper headers for CORS and JSON
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    const mergedOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
      mode: 'cors',
    };
    
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error('API request error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    } as T;
  }
}

/**
 * API service for interacting with the backend
 */
export const apiService = {
  /**
   * Create a new raffle activity
   */
  async createActivity(data: ActivityData): Promise<CreateActivityResponse> {
    return fetchApi<CreateActivityResponse>('/activity/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get list of all activities
   */
  async getActivities(): Promise<ActivityListResponse> {
    return fetchApi<ActivityListResponse>('/activities');
  },

  /**
   * Get activities created by a specific address
   */
  async getActivitiesByCreator(address: string): Promise<ActivityListResponse> {
    return fetchApi<ActivityListResponse>(`/activities/by-creator/${address}`);
  },

  /**
   * Get activity status
   */
  async getActivityStatus(activityId: string): Promise<ActivityStatusResponse> {
    return fetchApi<ActivityStatusResponse>(`/activity/${activityId}/status`);
  },

  /**
   * Get all items for an activity
   */
  async getActivityItems(activityId: string): Promise<ActivityItemsResponse> {
    return fetchApi<ActivityItemsResponse>(`/activity/${activityId}/items`);
  },

  /**
   * Get a specific item by its SID
   */
  async getItemBySid(activityId: string, sid: string): Promise<ActivityItemResponse> {
    return fetchApi<ActivityItemResponse>(`/activity/${activityId}/items/${sid}`);
  },

  /**
   * Reveal an activity's key
   */
  async revealActivity(activityId: string): Promise<RevealResponse> {
    return fetchApi<RevealResponse>(`/activity/${activityId}/reveal`, {
      method: 'POST',
    });
  },

  /**
   * Delete an activity and its related records (backend only)
   */
  async deleteActivity(activityId: string): Promise<ApiResponse> {
    return fetchApi<ApiResponse>(`/activity/${activityId}`, {
      method: 'DELETE',
    });
  }
};
