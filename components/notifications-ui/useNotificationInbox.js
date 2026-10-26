"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { notifyReadError } from "@/lib/client-read-error";
import { socket } from "../ui/SocketProvider";
import { NOTIFICATIONS_CHANGED } from "@/lib/notification-events";
import { canKeepLoadedPages } from "@/lib/see-more-pagination.mjs";
import { notificationInboxOptions, notificationsKeys, refreshNotificationQueries } from "@/lib/cache/notifications-queries";

export default function useNotificationInbox(initialData) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const isEmployer = user?.role === "employer";
  const [scope, setScope] = useState("all");
  // Requests filters by notification type, including answered requests.
  // The server's actionable flag separately controls response and deletion actions.
  const selectedScope = isEmployer ? scope : "all";
  const serverSnapshotRef = useRef(null);

  const inboxQuery = useInfiniteQuery({
    ...notificationInboxOptions(user.id, selectedScope),
    initialData:
      selectedScope === "all" && initialData
        ? { pages: [initialData], pageParams: [1] }
        : undefined,
  });

  const notifications = useMemo(() => {
    const seen = new Set();
    return (inboxQuery.data?.pages ?? []).flatMap((page) =>
      page.data.filter((item) => {
        const key = item.ui_key || item.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }),
    );
  }, [inboxQuery.data]);
  const firstPage = inboxQuery.data?.pages[0];
  const totalRecords = firstPage?.totalRecords ?? 0;
  const unreadCount = firstPage?.unreadCount ?? 0;
  const isLoadingMore = inboxQuery.isFetchingNextPage;

  useEffect(() => {
    if (serverSnapshotRef.current === initialData) return;
    serverSnapshotRef.current = initialData;
    if (!initialData?.data) return;

    queryClient.setQueryData(notificationsKeys.inbox(user.id), (old) => {
      if (!old?.pages?.length) {
        return { pages: [initialData], pageParams: [1] };
      }
      const previous = old.pages[0];
      // Keep later pages only when the refreshed first page still agrees with
      // their ordering and total; otherwise discard obsolete pagination offsets.
      const keepLoaded = canKeepLoadedPages(
        previous.data.map((item) => item.ui_key || item.id),
        previous.totalRecords,
        initialData.data,
        initialData.totalRecords,
        (item) => item.ui_key || item.id,
      );
      return {
        pages: keepLoaded ? [initialData, ...old.pages.slice(1)] : [initialData],
        pageParams: keepLoaded ? old.pageParams : [1],
      };
    });
    queryClient.setQueryData(notificationsKeys.count(user.id), initialData.unreadCount);
  }, [initialData, queryClient, user.id]);

  useEffect(() => {
    if (inboxQuery.error && inboxQuery.data) {
      notifyReadError("Could not load notifications:", inboxQuery.error);
    }
  }, [inboxQuery.error, inboxQuery.data]);

  useEffect(() => {
    let timer;
    const scheduleRefresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => refreshNotificationQueries(queryClient, user.id), 150);
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") scheduleRefresh();
    };
    socket.on("new_notification", scheduleRefresh);
    socket.on("connect", scheduleRefresh);
    socket.on("supervisor_status_changed", scheduleRefresh);
    window.addEventListener(NOTIFICATIONS_CHANGED, scheduleRefresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      clearTimeout(timer);
      socket.off("new_notification", scheduleRefresh);
      socket.off("connect", scheduleRefresh);
      socket.off("supervisor_status_changed", scheduleRefresh);
      window.removeEventListener(NOTIFICATIONS_CHANGED, scheduleRefresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [queryClient, user.id]);

  return {
    isEmployer, scope, setScope, selectedScope, inboxQuery,
    notifications, totalRecords, unreadCount, isLoadingMore,
  };
}
