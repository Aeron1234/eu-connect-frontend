"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellRing, Inbox } from "lucide-react";
import MarkAllAsReadButton from "./MarkAllAsReadButton";
import NotificationItem from "./NotificationItem";
import { getInbox } from "@/lib/server-actions/notifications-actions";
import { useUser } from "@/contexts/UserContext";
import { socket } from "./SocketProvider";
import {
  NOTIFICATIONS_CHANGED,
  notifyNotificationsChanged,
} from "@/lib/notification-events";
import { canKeepLoadedPages, hasValidPage, pageAfterRefresh, reconcilePageOne } from "@/lib/see-more-pagination.mjs";

const scopeTabs = [
  { label: "All", value: "all" },
  { label: "Requests", value: "requests" },
];

function keyOf(n) {
  return n.id;
}

function NotificationList({ inboxData: initialData }) {
  const { user } = useUser();
  const userRole = user?.role;
  const isEmployer = userRole === "employer";

  const [notifications, setNotifications] = useState(initialData?.data || []);
  const [page, setPage] = useState(initialData?.currentPage || 1);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 1);
  const [totalRecords, setTotalRecords] = useState(
    initialData?.totalRecords || 0,
  );
  const [unreadCount, setUnreadCount] = useState(initialData?.unreadCount || 0);
  const [scope, setScope] = useState("all");
  const [isPending, setIsPending] = useState(false);

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);
  const lastInitialDataRef = useRef(initialData);
  const firstPageIdsRef = useRef((initialData?.data || []).map(keyOf));
  const firstPageTotalRef = useRef(initialData?.totalRecords || 0);
  const loadedScopeRef = useRef("all");

  const refreshPageOne = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsPending(true);
    try {
      const fresh = await getInbox({ scope, page: 1 });
      if (requestId !== requestIdRef.current || !hasValidPage(fresh, "data", null)) {
        return false;
      }

      const keepLoadedPages = loadedScopeRef.current === scope && canKeepLoadedPages(
        firstPageIdsRef.current,
        firstPageTotalRef.current,
        fresh.data,
        fresh.totalRecords,
        keyOf,
      );
      firstPageIdsRef.current = fresh.data.map(keyOf);
      firstPageTotalRef.current = fresh.totalRecords;
      loadedScopeRef.current = scope;
      setNotifications((current) => reconcilePageOne(current, fresh.data, keepLoadedPages, keyOf));
      setPage((current) => pageAfterRefresh(current, keepLoadedPages));
      setTotalPages(fresh.totalPages || 1);
      setTotalRecords(fresh.totalRecords || 0);
      setUnreadCount(fresh.unreadCount || 0);
      return true;
    } catch (error) {
      console.error("Could not refresh notifications:", error);
      return false;
    } finally {
      if (requestId === requestIdRef.current) setIsPending(false);
    }
  }, [scope]);

  useEffect(() => {
    if (!isEmployer && scope !== "all") {
      setScope("all");
    }
  }, [isEmployer, scope]);

  useEffect(() => {
    if (lastInitialDataRef.current === initialData) return;
    lastInitialDataRef.current = initialData;
    if (scope !== "all" || !hasValidPage(initialData, "data", null)) return;

    const keepLoadedPages = loadedScopeRef.current === "all" && canKeepLoadedPages(
      firstPageIdsRef.current,
      firstPageTotalRef.current,
      initialData.data,
      initialData.totalRecords,
      keyOf,
    );
    firstPageIdsRef.current = initialData.data.map(keyOf);
    firstPageTotalRef.current = initialData.totalRecords;
    loadedScopeRef.current = "all";
    requestIdRef.current += 1;
    setIsPending(false);
    setNotifications((current) => reconcilePageOne(current, initialData.data, keepLoadedPages, keyOf));
    setPage((current) => pageAfterRefresh(current, keepLoadedPages));
    setTotalPages(initialData?.totalPages || 1);
    setTotalRecords(initialData?.totalRecords || 0);
    setUnreadCount(initialData?.unreadCount || 0);
  }, [initialData, scope]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    // Invalidate a read for the previous scope before it can update this tab.
    requestIdRef.current += 1;
    const timeout = setTimeout(refreshPageOne, 500);

    return () => clearTimeout(timeout);
  }, [scope, refreshPageOne]);

  useEffect(() => {
    let timer;
    let active = true;
    let sequence = 0;
    const runRefresh = async (current, attempt) => {
      const succeeded = await refreshPageOne();
      if (active && current === sequence && !succeeded && attempt < 2) {
        timer = setTimeout(
          () => runRefresh(current, attempt + 1),
          1000 * (attempt + 1),
        );
      }
    };
    const scheduleRefresh = () => {
      const current = ++sequence;
      clearTimeout(timer);
      timer = setTimeout(() => runRefresh(current, 0), 150);
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") scheduleRefresh();
    };

    socket.on("new_notification", scheduleRefresh);
    socket.on("connect", scheduleRefresh);
    window.addEventListener(NOTIFICATIONS_CHANGED, scheduleRefresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      active = false;
      clearTimeout(timer);
      requestIdRef.current += 1;
      socket.off("new_notification", scheduleRefresh);
      socket.off("connect", scheduleRefresh);
      window.removeEventListener(NOTIFICATIONS_CHANGED, scheduleRefresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refreshPageOne]);

  async function handleSeeMore() {
    if (isPending || page >= totalPages) return;
    setIsPending(true);
    const nextPage = page + 1;
    const thisRequestId = ++requestIdRef.current;

    try {
      const newData = await getInbox({ scope, page: nextPage });

      if (thisRequestId !== requestIdRef.current) return;

      if (!hasValidPage(newData, "data", null, nextPage)) {
        console.error("Error loading more notifications:", newData?.error || "Invalid response from the server");
        return;
      }

      const incoming = newData.data;

      setNotifications((prev) => {
        const existingKeys = new Set(prev.map(keyOf));
        const filteredNew = incoming.filter((n) => !existingKeys.has(keyOf(n)));
        return [...prev, ...filteredNew];
      });

      setPage(nextPage);
      if (newData?.totalPages) setTotalPages(newData.totalPages);
    } catch (error) {
      if (thisRequestId === requestIdRef.current) {
        console.error("Error loading more notifications:", error);
      }
    } finally {
      if (thisRequestId === requestIdRef.current) setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter bar */}
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

      {/* Stat cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2">
        <StatCard
          icon={<Bell className="size-5 opacity-80" />}
          value={String(totalRecords)}
          label={
            scope === "requests" ? "Supervisor Requests" : "All Notifications"
          }
          highlight
        />
        <StatCard
          icon={<BellRing className="size-5 text-muted-foreground" />}
          value={String(unreadCount)}
          label="Unread"
        />
      </div>

      {/* List */}
      {notifications.length === 0 && !isPending ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
          <Inbox className="size-8 text-foreground-faint" />
          <p className="text-sm font-medium text-muted-foreground">
            {scope === "requests"
              ? "No supervisor requests right now"
              : "You're all caught up"}
          </p>
          <p className="max-w-sm text-xs text-foreground-subtle">
            {scope === "requests"
              ? "New requests from students will show up here."
              : "New approvals, announcements, and updates will show up here."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((item) => (
            <li key={item.ui_key || item.id} className="flex-1">
              <NotificationItem
                item={item}
                onChanged={notifyNotificationsChanged}
              />
            </li>
          ))}
        </ul>
      )}

      {page < totalPages && (
        <div className="text-center">
          <button
            onClick={handleSeeMore}
            disabled={isPending}
            className="text-sm font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
          >
            {isPending ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, highlight }) {
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
        <p className="text-xl sm:text-2xl font-bold leading-none">{value}</p>
        <p
          className={`mt-1.5 text-xs ${
            highlight ? "opacity-80" : "text-muted-foreground"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export default NotificationList;
