import Constants from "expo-constants";
import { session } from "./session";

const BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  console.error(
    "ERROR: EXPO_PUBLIC_API_BASE_URL is not defined. Please set it in your .env file",
  );
}

// Mobile networks can leave fetch hanging indefinitely without this.
const REQUEST_TIMEOUT_MS = 20000;

/** Error thrown for any failed request. `status` is the HTTP status code, or 0 for network/timeout failures. */
export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type RequestOptions = {
  method?: RequestMethod;
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers: customHeaders } = options;

  if (!BASE_URL) {
    throw new ApiError(
      0,
      "API_BASE_URL is not configured. Please set EXPO_PUBLIC_API_BASE_URL in your .env file",
    );
  }

  const isFormData = body instanceof FormData;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...customHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(0, "Request timed out. Check your connection and try again.");
    }
    throw new ApiError(0, "Network request failed. Check your connection and try again.");
  } finally {
    clearTimeout(timeout);
  }

  const contentType = res.headers.get("content-type");
  let data: T;

  if (contentType?.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) throw new ApiError(res.status, `Request failed: ${res.status}`, text);
    data = text as unknown as T;
  }

  if (!res.ok) {
    let errorMessage = `Request failed: ${res.status}`;
    if (data) {
      const errorData = data as { message?: string; error?: string };
      if (errorData.message) errorMessage = errorData.message;
      else if (errorData.error) errorMessage = errorData.error;
    }
    throw new ApiError(res.status, errorMessage, data);
  }

  return data;
}

// Single in-flight refresh shared by all concurrent 401s.
let refreshPromise: Promise<boolean> | null = null;

const refreshSession = async (): Promise<boolean> => {
  const refreshToken = await session.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const data = await request<{ access_token: string; refresh_token: string }>(
      "/auth/refresh",
      { method: "POST", body: { refresh_token: refreshToken } },
    );
    await session.setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
};

/**
 * Authenticated request. On a 401 it refreshes the session once (de-duplicated
 * across concurrent requests) and retries; if the refresh fails, the session
 * is cleared and the original error is rethrown.
 */
export async function authedRequest<T>(
  path: string,
  options: Omit<RequestOptions, "token"> = {},
): Promise<T> {
  const token = await session.getToken();
  if (!token) throw new ApiError(401, "Not authenticated");

  try {
    return await request<T>(path, { ...options, token });
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) throw err;

    if (!refreshPromise) {
      refreshPromise = refreshSession().finally(() => {
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;

    if (!refreshed) {
      await session.clearTokens();
      throw err;
    }

    const newToken = await session.getToken();
    return request<T>(path, { ...options, token: newToken ?? undefined });
  }
}
