import { useQuery } from "@tanstack/react-query";
import { members } from "@/lib/api/members.api";

export const PROFILE_QUERY_KEY = ["profile"] as const;

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: members.getProfile,
    staleTime: 5 * 60_000,
  });
}
