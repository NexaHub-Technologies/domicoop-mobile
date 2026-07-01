import { dashboard } from "@/lib/api/dashboard.api";
import { DashboardSummary } from "@/lib/types/dashboard";
import { usePersistedQuery } from "./usePersistedQuery";

const CACHE_KEY = "cached_savings_summary";

export function useSavingsSummary() {
  const query = usePersistedQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    cacheKey: CACHE_KEY,
    queryFn: () => dashboard.getSummary(),
  });

  return {
    summary: query.data ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isRefreshing,
    error: query.error,
    isOffline: query.isOffline,
    refresh: query.refresh,
  };
}
