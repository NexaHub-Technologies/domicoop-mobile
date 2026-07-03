import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
} from "../types/sign-up";
import { request, authedRequest } from "../http";
import { session } from "../session";

export const auth = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await request<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password } as LoginRequest,
    });

    await session.setTokens(response.access_token, response.refresh_token);
    await session.setEmail(email);
    return response;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return await request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: data,
    });
  },

  logout: async (): Promise<{ success: boolean }> => {
    // Best-effort server call: local sign-out must succeed even when offline.
    try {
      return await authedRequest<{ success: boolean }>("/auth/logout", {
        method: "POST",
      });
    } catch {
      return { success: true };
    } finally {
      await session.clearTokens();
    }
  },

  refreshToken: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await request<RefreshResponse>("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });

    await session.setTokens(response.access_token, response.refresh_token);
    return response;
  },
};

export default auth;
