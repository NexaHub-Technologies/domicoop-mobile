import { useEffect } from "react";
import { Platform } from "react-native";
import { Href, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications.api";
import {
  PUSH_TOKEN_KEY,
  ensureAndroidChannel,
  getPushToken,
  setAppBadge,
} from "@/lib/notifications";
import { NOTIFICATIONS_QUERY_KEY } from "./useNotifications";
import { useUnreadCount } from "./useUnreadCount";

const getPushUrl = (
  response: Notifications.NotificationResponse | null,
): string | null => {
  const url = response?.notification.request.content.data?.url;
  return typeof url === "string" && url.startsWith("/") ? url : null;
};

/**
 * Push-notification lifecycle. Mounted in the (tabs) layout so it only runs
 * after login: permission is requested on first arrival at the dashboard and
 * token registration always has a session for authedRequest.
 */
export function usePushNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const unreadCount = useUnreadCount();

  // Register this device's push token with the backend (once per token).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureAndroidChannel();
        const token = await getPushToken();
        if (!token || cancelled) return;
        const registered = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
        if (registered === token) return;
        await notificationsApi.registerDevice(
          token,
          Platform.OS,
          Device.modelName ?? undefined,
        );
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      } catch {
        // silent — permission denied, endpoint missing, or offline; retried next mount
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Push received while the app is foregrounded → refresh list + badge.
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    });
    return () => sub.remove();
  }, [queryClient]);

  // Notification tapped (app warm or backgrounded) → deep link.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = getPushUrl(response);
        if (url) router.push(url as Href);
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      },
    );
    return () => sub.remove();
  }, [router, queryClient]);

  // Cold start from a notification tap: tabs mount after launch, so replay it.
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      const url = getPushUrl(response);
      if (url) router.push(url as Href);
    });
  }, [router]);

  // Keep the app-icon badge in sync with the unread count.
  useEffect(() => {
    setAppBadge(unreadCount);
  }, [unreadCount]);
}
