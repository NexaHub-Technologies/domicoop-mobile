import {
  LoginRequest,
  LoginResponse,
  Profile,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
  UpdateProfileRequest,
} from "../types/sign-up";
import { request, authedRequest } from "../http";
import { session } from "../session";

export const signUp = {
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
    const token = await session.getToken();
    const response = await request<{ success: boolean }>("/auth/logout", {
      method: "POST",
      token: token ?? undefined,
    });

    await session.clearTokens();
    return response;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await request<RefreshResponse>("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });

    await session.setTokens(response.access_token, response.refresh_token);
    return response;
  },

  getProfile: async (): Promise<Profile> => {
    return await authedRequest<Profile>("/members/me", {
      method: "GET",
    });
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<Profile> => {
    return await authedRequest<Profile>("/members/me", {
      method: "PATCH",
      body: data,
    });
  },

  googleLogin: async (idToken: string): Promise<LoginResponse> => {
    const response = await request<LoginResponse>("/auth/google", {
      method: "POST",
      body: { id_token: idToken },
    });

    await session.setTokens(response.access_token, response.refresh_token);
    if (response.user?.email) {
      await session.setEmail(response.user.email);
    }
    return response;
  },
};

export default signUp;
