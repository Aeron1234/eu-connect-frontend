"use client";

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  getInboxResult,
  getUnreadNotificationCountResult,
} from "@/lib/server-actions/notifications-actions";
import { hasValidPage } from "@/lib/see-more-pagination.mjs";

// Separate inboxes by viewer, tab and page size; share that viewer's unread count.
export const notificationsKeys = {
  all: (userId) => ["notifications", String(userId)],
  inboxes: (userId) => [...notificationsKeys.all(userId), "inbox"],
  inbox: (userId, scope = "all", limit = 10) => [
    ...notificationsKeys.inboxes(userId),
    scope,
    limit,
  ],
  count: (userId) => [...notificationsKeys.all(userId), "unread-count"],
};

const refreshTimers = new WeakMap();

export function notificationInboxOptions(userId, scope = "all", limit = 10) {
  return infiniteQueryOptions({
    queryKey: notificationsKeys.inbox(userId, scope, limit),
    queryFn: async ({ pageParam }) => {
      const result = await getInboxResult({ scope, page: pageParam, limit });
      if (!hasValidPage(result, "data", null, pageParam)) {
        throw new Error(result?.error || "Invalid notifications response");
      }
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function notificationCountOptions(userId) {
  return queryOptions({
    queryKey: notificationsKeys.count(userId),
    queryFn: async () => {
      const result = await getUnreadNotificationCountResult();
      const count = Number(result?.unreadCount);
      if (!Number.isFinite(count) || count < 0) {
        throw new Error(result?.error || "Invalid unread count response");
      }
      return count;
    },
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Coalesce refreshes from multiple mounted views for the same viewer/client.
// Invalidate both inbox scopes and the independent unread badge.
export function refreshNotificationQueries(queryClient, userId) {
  let timers = refreshTimers.get(queryClient);
  if (!timers) {
    timers = new Map();
    refreshTimers.set(queryClient, timers);
  }
  const key = String(userId);
  clearTimeout(timers.get(key));
  timers.set(key, setTimeout(() => {
    timers.delete(key);
    void queryClient.invalidateQueries({ queryKey: notificationsKeys.all(userId) });
  }, 30));
}

export function updateNotificationInboxes(queryClient, userId, updatePage) {
  queryClient.setQueriesData({ queryKey: notificationsKeys.inboxes(userId) }, (old) =>
    old?.pages?.length
      ? { ...old, pages: old.pages.map(updatePage) }
      : old,
  );
}
