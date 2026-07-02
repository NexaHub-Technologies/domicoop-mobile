import { authedRequest, ApiError } from "@/lib/http";
import {
  ApiNotificationListResponse,
  ApiNotificationPreferences,
  NotificationListPage,
  NotificationPreferences,
  serializePreferencesPatch,
  transformListResponse,
  transformPreferences,
} from "@/lib/types/notifications";

// A 404 from these endpoints means the backend hasn't deployed the feature
// yet (see the REST contract in the plan/DESIGN docs). Reads degrade to empty
// results here so every consumer behaves identically; mutation 404s are left
// to callers, which treat them as silent success.
const isNotDeployed = (err: unknown) =>
  err instanceof ApiError && err.status === 404;

const EMPTY_PAGE: NotificationListPage = {
  notifications: [],
  page: 1,
  totalPages: 1,
  total: 0,
  unreadCount: 0,
};

export const notificationsApi = {
  list: async (page = 1, limit = 20): Promise<NotificationListPage> => {
    try {
      const raw = await authedRequest<ApiNotificationListResponse>(
        `/notifications/me?page=${page}&limit=${limit}`,
      );
      return transformListResponse(raw);
    } catch (err) {
      if (isNotDeployed(err)) return EMPTY_PAGE;
      throw err;
    }
  },

  markRead: (id: string) =>
    authedRequest<{ unread_count: number }>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllRead: () =>
    authedRequest<{ unread_count: number }>("/notifications/me/read-all", {
      method: "POST",
    }),

  clearAll: () =>
    authedRequest<void>("/notifications/me", { method: "DELETE" }),

  registerDevice: (token: string, platform: string, deviceName?: string) =>
    authedRequest<void>("/notifications/devices", {
      method: "POST",
      body: { token, platform, device_name: deviceName },
    }),

  unregisterDevice: (token: string) =>
    authedRequest<void>("/notifications/devices/unregister", {
      method: "POST",
      body: { token },
    }),

  getPreferences: async (): Promise<NotificationPreferences | null> => {
    try {
      const raw = await authedRequest<ApiNotificationPreferences>(
        "/notifications/preferences",
      );
      return transformPreferences(raw);
    } catch (err) {
      if (isNotDeployed(err)) return null;
      throw err;
    }
  },

  updatePreferences: async (
    patch: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> => {
    const raw = await authedRequest<ApiNotificationPreferences>(
      "/notifications/preferences",
      { method: "PATCH", body: serializePreferencesPatch(patch) },
    );
    return transformPreferences(raw);
  },
};
