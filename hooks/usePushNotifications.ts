import { useEffect } from "react";
import { Platform } from "react-native";
import { Href, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications.api";
import { NotificationType } from "@/lib/types/notifications";
import {
  PUSH_TOKEN_KEY,
  ensureAndroidChannel,
  getPushToken,
  setAppBadge,
} from "@/lib/notifications";
import { NOTIFICATIONS_QUERY_KEY } from "./useNotifications";
import { useUnreadCount } from "./useUnreadCount";

interface PushData {
  url?: string | null;
  notification_id?: string | null;
  type?: NotificationType;
}

// Fallback route per notification type when the payload carries no url.
const TYPE_ROUTES: Record<NotificationType, Href> = {
  loan: "/(tabs)/loans",
  contribution: "/(tabs)/contributions",
  dividend: "/(tabs)/contributions",
  security: "/notifications",
  meeting: "/notifications",
};

const getPushData = (
  response: Notifications.NotificationResponse | null,
): PushData => (response?.notification.request.content.data ?? {}) as PushData;

const getRoute = (data: PushData): Href | null => {
  if (typeof data.url === "string" && data.url.startsWith("/")) {
    return data.url as Href;
  }
  return data.type ? (TYPE_ROUTES[data.type] ?? null) : null;
};

// On cold start the launching tap can surface via both the response listener
// and getLastNotificationResponseAsync — handle each response only once.
let lastHandledResponseId: string | null = null;

/**
 * Push-notification lifecycle. Mounted in the (tabs) layout so it only runs
 * after login: permission is requested on first arrival at the dashboard and
 * token registration always has a session for authedRequest.
 */
export function usePushNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const unreadCount = useUnreadCount();

  // Register this device with the backend. Runs on every mount: registration
  // is an idempotent upsert and the token belongs to whoever registered it
  // last, so re-registering after an account switch reassigns it correctly.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureAndroidChannel();
        const token = await getPushToken();
        if (!token || cancelled) return;
        console.log("[Notifications] Push token:", token);
        await notificationsApi.registerDevice(
          token,
          Platform.OS,
          Device.deviceName ?? Device.modelName ?? undefined,
        );
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      } catch (err) {
        // Registration is retried on next mount; log why it failed this time.
        console.warn("[Notifications] Push setup failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // A tapped notification is read: tell the backend (fire-and-forget), sync
  // the badge from the authoritative unread_count, and refresh the center.
  const handleTap = (response: Notifications.NotificationResponse) => {
    const responseId = response.notification.request.identifier;
    if (responseId && responseId === lastHandledResponseId) return;
    lastHandledResponseId = responseId;

    const data = getPushData(response);
    if (data.notification_id) {
      notificationsApi
        .markRead(data.notification_id)
        .then((res) => setAppBadge(res.unread_count))
        .catch(() => {});
    }
    const route = getRoute(data);
    if (route) router.push(route);
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
  };

  // Push received while the app is foregrounded → refresh list + badge.
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  // Notification tapped (app warm or backgrounded).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => handleTap(response),
    );
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, queryClient]);

  // Cold start from a notification tap: tabs mount after launch, so replay it.
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleTap(response);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Keep the app-icon badge in sync with the unread count.
  useEffect(() => {
    setAppBadge(unreadCount);
  }, [unreadCount]);
}
