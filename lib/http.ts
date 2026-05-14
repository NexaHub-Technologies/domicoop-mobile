import Constants from "expo-constants";
import { session } from "./session";

const BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL;

console.log('DEBUG BASE_URL:', BASE_URL, 'Constants.expoConfig?.extra:', Constants.expoConfig?.extra);

if (!BASE_URL) {
  console.error(
    "ERROR: EXPO_PUBLIC_API_BASE_URL is not defined. Please set it in your .env file",
  );
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
    throw new Error(
      "API_BASE_URL is not configured. Please set EXPO_PUBLIC_API_BASE_URL in your .env file",
    );
  }

  const isFormData = body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...customHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type");
  let data: T;

  if (contentType?.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    data = text as unknown as T;
  }

  if (!res.ok) {
    let errorMessage = `Request failed: ${res.status}`;
    try {
      if (contentType?.includes("application/json") && data) {
        const errorData = data as { message?: string; error?: string };
        if (errorData.message) errorMessage = errorData.message;
        else if (errorData.error) errorMessage = errorData.error;
      }
    } catch {
      // ignore parsing errors
    }
    throw new Error(errorMessage);
  }

  return data;
}

export async function authedRequest<T>(
  path: string,
  options: Omit<RequestOptions, "token"> = {},
): Promise<T> {
  const token = await session.getToken();
  if (!token) throw new Error("Not authenticated");
  return request<T>(path, { ...options, token });
}
