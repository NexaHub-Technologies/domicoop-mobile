import { useCallback } from "react";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/lib/api/auth.api";
import { notificationsApi } from "@/lib/api/notifications.api";
import { PUSH_TOKEN_KEY } from "@/lib/notifications";
import { NOTIFICATIONS_CACHE_KEY } from "@/hooks/useNotifications";

/**
 * Signs the current user out and returns them to the sign-in screen. Push
 * unregister and the server logout call are best-effort so sign-out still
 * completes offline; cached query data and local caches are cleared so the
 * next account never sees this one's data.
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    // Best-effort push unregister — never blocks logout.
    try {
      const pushToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (pushToken) {
        notificationsApi.unregisterDevice(pushToken).catch(() => {});
      }
    } catch {
      // ignore
    }
    try {
      await auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    // Drop all cached data so the next account doesn't see this one's.
    queryClient.clear();
    AsyncStorage.multiRemove([PUSH_TOKEN_KEY, NOTIFICATIONS_CACHE_KEY]).catch(
      () => {}
    );
    // Land on sign-in with welcome seeded beneath it, so the back gesture and
    // back button from sign-in return to the welcome screen.
    router.replace("/welcome");
    router.push("/sign-in");
  }, [queryClient, router]);
}
