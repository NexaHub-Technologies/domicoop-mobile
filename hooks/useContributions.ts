import { contributionsApi } from "@/lib/api/contributions.api";
import { ContributionListResponse } from "@/lib/types/contributions";
import { usePersistedQuery } from "./usePersistedQuery";

const CACHE_KEY = "cached_contributions_response";

export function useContributions() {
  const year = new Date().getFullYear();

  const query = usePersistedQuery<ContributionListResponse>({
    queryKey: ["contributions", year],
    cacheKey: CACHE_KEY,
    queryFn: () => contributionsApi.getMyContributions({ year }),
  });

  return {
    contributions: query.data?.data ?? [],
    totalBalance: query.data?.totalBalance ?? 0,
    yearBalance: query.data?.yearBalance ?? 0,
    isLoading: query.isLoading,
    isRefreshing: query.isRefreshing,
    error: query.error,
    isOffline: query.isOffline,
    refresh: query.refresh,
  };
}
