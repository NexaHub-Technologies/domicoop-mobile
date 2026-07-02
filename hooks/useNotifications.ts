import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications.api";
import { Notification, NotificationListPage } from "@/lib/types/notifications";
import { ApiError } from "@/lib/http";
import { usePersistedQuery } from "./usePersistedQuery";

export const NOTIFICATIONS_QUERY_KEY = ["notifications", "page1"] as const;
export const NOTIFICATIONS_CACHE_KEY = "cached_notifications_page1";
export const NOTIFICATIONS_PAGE_SIZE = 20;

export const fetchNotificationsPage1 = () =>
  notificationsApi.list(1, NOTIFICATIONS_PAGE_SIZE);

// A mutation 404 means the backend hasn't deployed the feature — treat it as
// success and keep the optimistic state.
const isNotDeployed = (err: unknown) =>
  err instanceof ApiError && err.status === 404;

export function useNotifications() {
  const queryClient = useQueryClient();
  // Pages beyond the first are ephemeral: appended by loadMore, reset on refresh.
  const [extraPages, setExtraPages] = useState<Notification[][]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const query = usePersistedQuery<NotificationListPage>({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    cacheKey: NOTIFICATIONS_CACHE_KEY,
    queryFn: fetchNotificationsPage1,
  });

  const page1 = query.data;
  const notifications = [
    ...(page1?.notifications ?? []),
    ...extraPages.flat(),
  ];
  const pagesLoaded = 1 + extraPages.length;
  const hasMore = (page1?.totalPages ?? 1) > pagesLoaded;
  const unreadCount = page1?.unreadCount ?? 0;

  const setPage1 = useCallback(
    (updater: (old: NotificationListPage) => NotificationListPage) => {
      queryClient.setQueryData<NotificationListPage>(
        NOTIFICATIONS_QUERY_KEY,
        (old) => (old ? updater(old) : old),
      );
    },
    [queryClient],
  );

  const { refresh: refreshQuery } = query;
  const refresh = useCallback(async () => {
    setExtraPages([]);
    await refreshQuery();
  }, [refreshQuery]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const next = await notificationsApi.list(
        pagesLoaded + 1,
        NOTIFICATIONS_PAGE_SIZE,
      );
      setExtraPages((pages) => [...pages, next.notifications]);
    } catch {
      // silent — the button stays available for another try
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, pagesLoaded]);

  const markRead = useCallback(
    async (id: string) => {
      const target = notifications.find((n) => n.id === id);
      if (!target || target.isRead) return;

      const prevPage1 =
        queryClient.getQueryData<NotificationListPage>(NOTIFICATIONS_QUERY_KEY);
      const prevExtra = extraPages;

      setPage1((old) => ({
        ...old,
        notifications: old.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, old.unreadCount - 1),
      }));
      setExtraPages((pages) =>
        pages.map((page) =>
          page.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        ),
      );

      try {
        const res = await notificationsApi.markRead(id);
        setPage1((old) => ({ ...old, unreadCount: res.unread_count }));
      } catch (err) {
        if (isNotDeployed(err)) return;
        if (prevPage1) {
          queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, prevPage1);
        }
        setExtraPages(prevExtra);
      }
    },
    [notifications, extraPages, queryClient, setPage1],
  );

  const markAllRead = useCallback(async () => {
    const prevPage1 =
      queryClient.getQueryData<NotificationListPage>(NOTIFICATIONS_QUERY_KEY);
    const prevExtra = extraPages;

    setPage1((old) => ({
      ...old,
      notifications: old.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    setExtraPages((pages) =>
      pages.map((page) => page.map((n) => ({ ...n, isRead: true }))),
    );

    try {
      await notificationsApi.markAllRead();
    } catch (err) {
      if (isNotDeployed(err)) return;
      if (prevPage1) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, prevPage1);
      }
      setExtraPages(prevExtra);
    }
  }, [extraPages, queryClient, setPage1]);

  const clearAll = useCallback(async () => {
    const prevPage1 =
      queryClient.getQueryData<NotificationListPage>(NOTIFICATIONS_QUERY_KEY);
    const prevExtra = extraPages;

    setPage1((old) => ({
      ...old,
      notifications: [],
      unreadCount: 0,
      total: 0,
      totalPages: 1,
    }));
    setExtraPages([]);

    try {
      await notificationsApi.clearAll();
    } catch (err) {
      if (isNotDeployed(err)) return;
      if (prevPage1) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, prevPage1);
      }
      setExtraPages(prevExtra);
    }
  }, [extraPages, queryClient, setPage1]);

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isRefreshing: query.isRefreshing,
    error: query.error,
    isOffline: query.isOffline,
    refresh,
    loadMore,
    isLoadingMore,
    hasMore,
    markRead,
    markAllRead,
    clearAll,
  };
}
