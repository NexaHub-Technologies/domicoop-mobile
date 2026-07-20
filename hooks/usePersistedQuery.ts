import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "expo-router";
import { useQuery, QueryKey } from "@tanstack/react-query";
import { ApiError } from "@/lib/http";

/**
 * useQuery with an AsyncStorage-persisted fallback: successful responses are
 * written to disk, and when a fetch fails the last persisted copy is served —
 * flagged `isOffline` when the device has no connection. Also refetches when
 * the screen regains navigation focus.
 */
export function usePersistedQuery<T>(options: {
  queryKey: QueryKey;
  cacheKey: string;
  queryFn: () => Promise<T>;
}) {
  const { queryKey, cacheKey, queryFn } = options;
  const [fallback, setFallback] = useState<T | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await queryFn();
      AsyncStorage.setItem(cacheKey, JSON.stringify(data)).catch(() => {
        // ignore cache write errors
      });
      return data;
    },
  });

  useEffect(() => {
    if (query.isSuccess) {
      setFallback(null);
      setIsOffline(false);
      return;
    }
    if (!query.isError) return;

    // A 403 means the account is blocked (pending/suspended) from this
    // resource, not that the network failed — serving stale cached data
    // here would misrepresent the account's current access.
    if (query.error instanceof ApiError && query.error.status === 403) {
      setFallback(null);
      setIsOffline(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const [cached, netState] = await Promise.all([
        AsyncStorage.getItem(cacheKey),
        NetInfo.fetch(),
      ]);
      if (cancelled) return;
      if (cached) {
        try {
          setFallback(JSON.parse(cached) as T);
        } catch {
          // ignore cache parse errors
        }
      }
      setIsOffline(!netState.isConnected);
    })();
    return () => {
      cancelled = true;
    };
  }, [query.isError, query.isSuccess, cacheKey]);

  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const data = query.data ?? fallback;
  // Served-from-cache while offline is not an error state.
  const error =
    query.isError && !(isOffline && fallback)
      ? (query.error as Error).message
      : null;

  return {
    data,
    isLoading: query.isPending,
    isRefreshing: query.isRefetching,
    error,
    isOffline,
    refresh: refetch,
  };
}
