import { useQuery } from "@tanstack/react-query";
import {
  NOTIFICATIONS_QUERY_KEY,
  fetchNotificationsPage1,
} from "./useNotifications";

/**
 * Unread-notification count for badges. Shares the notification list's query
 * key, so whichever mounts first fetches and the other reads the cache.
 * Freshness comes from focus refetch and push-arrival invalidation; the poll
 * is a slow fallback (data-plan-conscious).
 */
export function useUnreadCount(): number {
  const { data } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: fetchNotificationsPage1,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
  return data?.unreadCount ?? 0;
}
