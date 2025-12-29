import { httpBatchLink, createTRPCProxyClient } from "@trpc/client";
import type { AppRouter } from "@zk-asset-raffle/trpc";
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

const DEFAULT_TRPC_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_TRPC_URL
    ? process.env.NEXT_PUBLIC_TRPC_URL
    : "http://localhost:5002/trpc";

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: DEFAULT_TRPC_URL
    })
  ]
});

export const apiService = {
  createActivity(data: CreateActivityRequest): Promise<CreateActivityResponse> {
    return client.activity.create.mutate(data);
  },

  getActivities(): Promise<ActivityListResponse> {
    return client.activity.list.query();
  },

  getActivitiesByCreator(address: string): Promise<ActivityListResponse> {
    return client.activity.listByCreator.query({ address });
  },

  getActivityStatus(activityId: string): Promise<ActivityStatusResponse> {
    return client.activity.status.query({ activityId });
  },

  getActivityItems(activityId: string): Promise<ActivityItemsResponse> {
    return client.activity.items.query({ activityId });
  },

  getItemBySid(activityId: string, sid: string): Promise<ActivityItemResponse> {
    return client.activity.itemBySid.query({ activityId, sid });
  },

  revealActivity(activityId: string): Promise<RevealResponse> {
    return client.activity.reveal.mutate({ activityId });
  },

  deleteActivity(activityId: string): Promise<ApiResponse> {
    return client.activity.delete.mutate({ activityId });
  }
};

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
