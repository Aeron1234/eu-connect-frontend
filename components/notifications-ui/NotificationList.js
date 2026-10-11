"use client";

import { notifyReadError } from "@/lib/client-read-error";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellRing, Inbox } from "lucide-react";
import MarkAllAsReadButton from "./MarkAllAsReadButton";
import NotificationItemSkeleton from "@/components/skeletons/NotificationItemSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import NotificationItem from "./NotificationItem";
import { useUser } from "@/contexts/UserContext";
import { socket } from "../ui/SocketProvider";
import {
  NOTIFICATIONS_CHANGED,
  notifyNotificationsChanged,
} from "@/lib/notification-events";
import { canKeepLoadedPages } from "@/lib/see-more-pagination.mjs";
import {
  notificationInboxOptions,
  notificationsKeys,
  refreshNotificationQueries,
} from "@/lib/cache/notifications-queries";

const scopeTabs = [
  { label: "All", value: "all" },
  { label: "Requests", value: "requests" },
];

function NotificationList({ inboxData: initialData }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const isEmployer = user?.role === "employer";
  const [scope, setScope] = useState("all");
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
    if (inboxQuery.error) {
      notifyReadError("Could not load notifications:", inboxQuery.error);
    }
  }, [inboxQuery.error]);

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
    window.addEventListener(NOTIFICATIONS_CHANGED, scheduleRefresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      clearTimeout(timer);
      socket.off("new_notification", scheduleRefresh);
      socket.off("connect", scheduleRefresh);
      window.removeEventListener(NOTIFICATIONS_CHANGED, scheduleRefresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [queryClient, user.id]);

  return (
    <div className="space-y-6">
      <div className="flex w-full flex-wrap items-center gap-3">
        {isEmployer && (
          <div className="flex rounded-lg bg-secondary p-1 w-fit">
            {scopeTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setScope(tab.value)}
                className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  scope === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-primary-emphasis"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        <div className="w-fit ml-auto">
          <MarkAllAsReadButton
            data={notifications}
            unreadCount={unreadCount}
            onChanged={notifyNotificationsChanged}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2">
        <StatCard
          icon={<Bell className="size-5 opacity-80" />}
          value={String(totalRecords)}
          label={selectedScope === "requests" ? "Supervisor Requests" : "All Notifications"}
          highlight
          loading={inboxQuery.isPending}
        />
        <StatCard
          icon={<BellRing className="size-5 text-muted-foreground" />}
          value={String(unreadCount)}
          label="Unread"
          loading={inboxQuery.isPending}
        />
      </div>

      {inboxQuery.isPending ? (
        <div className="flex flex-col gap-2" role="status" aria-label="Loading notifications">
          {Array.from({ length: 5 }, (_, index) => <NotificationItemSkeleton key={index} />)}
        </div>
      ) : inboxQuery.isError && !inboxQuery.data ? (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
          <p>Could not load notifications.</p>
          <button type="button" onClick={() => void inboxQuery.refetch()} className="mt-2 font-semibold text-primary-emphasis">
            Try again
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
          <Inbox className="size-8 text-foreground-faint" />
          <p className="text-sm font-medium text-muted-foreground">
            {selectedScope === "requests" ? "No supervisor requests right now" : "You're all caught up"}
          </p>
          <p className="max-w-sm text-xs text-foreground-subtle">
            {selectedScope === "requests"
              ? "New requests from students will show up here."
              : "New approvals, announcements, and updates will show up here."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((item) => (
            <li key={`${item.ui_key || item.id}:${Boolean(item.actionable)}`} className="flex-1">
              <NotificationItem item={item} onChanged={notifyNotificationsChanged} />
            </li>
          ))}
        </ul>
      )}

      {inboxQuery.hasNextPage && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => void inboxQuery.fetchNextPage()}
            disabled={isLoadingMore}
            className="text-sm font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
          >
            {isLoadingMore ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, highlight, loading = false }) {
  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 rounded-xl border px-4 sm:px-5 py-4 sm:py-5 shadow-sm ${
        highlight
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground"
      }`}
    >
      {icon}
      <div>
        {loading ? <Skeleton className={`h-6 w-10 ${highlight ? "bg-white/30" : ""}`} /> : <p className="text-xl sm:text-2xl font-bold leading-none">{value}</p>}
        {loading ? <Skeleton className={`mt-1.5 h-3 w-24 ${highlight ? "bg-white/25" : ""}`} /> : <p className={`mt-1.5 text-xs ${highlight ? "opacity-80" : "text-muted-foreground"}`}>{label}</p>}
      </div>
    </div>
  );
}

export default NotificationList;
