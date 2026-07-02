import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

/** AsyncStorage key holding the Expo push token last registered with the backend. */
export const PUSH_TOKEN_KEY = "registered_push_token";

// How incoming pushes present while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/** The channel the backend targets via `channelId: "default"` in push payloads. */
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "General",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#003cad",
  });
}

/**
 * Request permission (covers Android 13 POST_NOTIFICATIONS) and return the
 * Expo push token, or null when denied or running on an emulator.
 */
export async function getPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("[Notifications] Skipping push token — not a physical device");
    return null;
  }

  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;
  if (status !== "granted") {
    finalStatus = (await Notifications.requestPermissionsAsync()).status;
  }
  if (finalStatus !== "granted") {
    console.log("[Notifications] Push permission not granted");
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = await Notifications.getExpoPushTokenAsync({ projectId });

  return token.data;
}

/** Sync the app-icon badge to the unread count; launcher support varies on Android. */
export async function setAppBadge(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch {
    // best-effort
  }
}
