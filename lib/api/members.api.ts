import { Profile, UpdateProfileRequest } from "../types/sign-up";
import { authedRequest } from "../http";

export const members = {
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
};

export default members;
