import type {
  ApiResponse,
  ActivityItemsResponse,
  ActivityItemResponse,
  ActivityListResponse,
  ActivityStatusResponse,
  CreateActivityRequest,
  CreateActivityResponse,
  RevealResponse
} from "@zk-asset-raffle/types";

const DEFAULT_BASE_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : "http://localhost:5002/api";

export function createApiService(baseUrl = DEFAULT_BASE_URL) {
  async function fetchApi<T extends ApiResponse>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${baseUrl}${endpoint}`;
      const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json"
      };

      const mergedOptions: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {})
        },
        mode: "cors"
      };

      const response = await fetch(url, mergedOptions);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error("API request error:", error);
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      } as T;
    }
  }

  return {
    createActivity(data: CreateActivityRequest): Promise<CreateActivityResponse> {
      return fetchApi<CreateActivityResponse>("/activity/create", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },

    getActivities(): Promise<ActivityListResponse> {
      return fetchApi<ActivityListResponse>("/activities");
    },

    getActivitiesByCreator(address: string): Promise<ActivityListResponse> {
      return fetchApi<ActivityListResponse>(`/activities/by-creator/${address}`);
    },

    getActivityStatus(activityId: string): Promise<ActivityStatusResponse> {
      return fetchApi<ActivityStatusResponse>(`/activity/${activityId}/status`);
    },

    getActivityItems(activityId: string): Promise<ActivityItemsResponse> {
      return fetchApi<ActivityItemsResponse>(`/activity/${activityId}/items`);
    },

    getItemBySid(activityId: string, sid: string): Promise<ActivityItemResponse> {
      return fetchApi<ActivityItemResponse>(`/activity/${activityId}/items/${sid}`);
    },

    revealActivity(activityId: string): Promise<RevealResponse> {
      return fetchApi<RevealResponse>(`/activity/${activityId}/reveal`, {
        method: "POST"
      });
    },

    deleteActivity(activityId: string): Promise<ApiResponse> {
      return fetchApi<ApiResponse>(`/activity/${activityId}`, {
        method: "DELETE"
      });
    }
  };
}

export const apiService = createApiService();
export type {
  ApiResponse,
  ActivityItemsResponse,
  ActivityItemResponse,
  ActivityListResponse,
  ActivityStatusResponse,
  CreateActivityRequest,
  CreateActivityResponse,
  RevealResponse
};
