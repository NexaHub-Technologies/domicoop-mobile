import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_EMAIL_KEY = "user_email";
const LAST_ACTIVITY_KEY = "last_activity_at";

// Session expires after this long without user activity (API calls bump it).
const SESSION_TTL_MS = 10 * 60 * 1000;

// Throttle SecureStore writes: at most one activity bump per interval.
const TOUCH_THROTTLE_MS = 30 * 1000;
let lastTouchAt = 0;

export const session = {
  setTokens: async (accessToken: string, refreshToken: string): Promise<void> => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    lastTouchAt = Date.now();
    await SecureStore.setItemAsync(LAST_ACTIVITY_KEY, String(lastTouchAt));
  },

  /** Record user activity, extending the session's idle window. */
  touch: async (): Promise<void> => {
    const now = Date.now();
    if (now - lastTouchAt < TOUCH_THROTTLE_MS) return;
    lastTouchAt = now;
    await SecureStore.setItemAsync(LAST_ACTIVITY_KEY, String(now));
  },

  /** True when a token exists and the last activity was within the idle TTL. */
  isValid: async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (!token) return false;
    const lastActivity = await SecureStore.getItemAsync(LAST_ACTIVITY_KEY);
    if (!lastActivity) return false;
    return Date.now() - Number(lastActivity) < SESSION_TTL_MS;
  },

  setEmail: async (email: string): Promise<void> => {
    await SecureStore.setItemAsync(USER_EMAIL_KEY, email);
  },

  getToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  getEmail: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(USER_EMAIL_KEY);
  },

  clearTokens: async (): Promise<void> => {
    lastTouchAt = 0;
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
    await SecureStore.deleteItemAsync(LAST_ACTIVITY_KEY);
  },
};
