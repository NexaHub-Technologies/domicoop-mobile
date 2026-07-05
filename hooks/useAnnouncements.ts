import { useMemo } from "react";
import { dashboard } from "@/lib/api/dashboard.api";
import { DashboardSummary } from "@/lib/types/dashboard";
import { Notification } from "@/lib/types/notifications";
import { usePersistedQuery } from "./usePersistedQuery";

const CACHE_KEY = "cached_savings_summary";

/**
 * Maps a dashboard announcement to the Notification shape used by
 * NotificationCard, so announcements render consistently with other
 * notification types.
 */
function announcementToNotification(
  announcement: DashboardSummary["announcements"][number],
): Notification {
  return {
    id: announcement.id,
    type: "announcement",
    title: announcement.title,
    message: announcement.body,
    timestamp: announcement.created_at,
    isRead: false,
  };
}

export function useAnnouncements() {
  const query = usePersistedQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    cacheKey: CACHE_KEY,
    queryFn: () => dashboard.getSummary(),
  });

  const announcements = useMemo(
    () => (query.data?.announcements ?? []).map(announcementToNotification),
    [query.data?.announcements],
  );

  return {
    announcements,
    isLoading: query.isLoading,
    isRefreshing: query.isRefreshing,
    error: query.error,
    isOffline: query.isOffline,
    refresh: query.refresh,
  };
}
