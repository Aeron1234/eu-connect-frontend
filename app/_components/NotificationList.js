"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellRing, Inbox } from "lucide-react";
import MarkAllAsReadButton from "./MarkAllAsReadButton";
import NotificationItem from "./NotificationItem";
import { getInbox } from "@/lib/server-actions/notifications-actions";
import { useUser } from "@/contexts/UserContext";

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
  const isFirstReconcile = useRef(true);
  const prevPage1KeysRef = useRef(
    new Set((initialData?.data || []).map(keyOf)),
  );

  useEffect(() => {
    if (!isEmployer && scope !== "all") {
      setScope("all");
    }
  }, [isEmployer, scope]);

  useEffect(() => {
    if (scope !== "all") return;

    if (isFirstReconcile.current) {
      isFirstReconcile.current = false;
      return;
    }

    const freshMap = new Map(
      (initialData?.data || []).map((n) => [keyOf(n), n]),
    );
    const prevPage1Keys = prevPage1KeysRef.current;

    setNotifications((prev) => {
      if (prev.length === 0) return initialData?.data || [];

      const updatedList = prev
        .map((n) => freshMap.get(keyOf(n)) || n)
        .filter((n) => {
          const wasOnPage1Before = prevPage1Keys.has(keyOf(n));
          const isStillFresh = freshMap.has(keyOf(n));
          return !wasOnPage1Before || isStillFresh;
        });

      const existingKeys = new Set(updatedList.map(keyOf));
      const brandNew = (initialData?.data || []).filter(
        (n) => !existingKeys.has(keyOf(n)),
      );

      return [...brandNew, ...updatedList];
    });

    setPage(initialData?.currentPage || 1);
    setTotalPages(initialData?.totalPages || 1);
    setTotalRecords(initialData?.totalRecords || 0);
    setUnreadCount(initialData?.unreadCount || 0);

    prevPage1KeysRef.current = new Set((initialData?.data || []).map(keyOf));
  }, [initialData, scope]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const thisRequestId = ++requestIdRef.current;

    const timeout = setTimeout(async () => {
      setIsPending(true);
      try {
        const newData = await getInbox({ scope, page: 1 });

        if (thisRequestId !== requestIdRef.current) return;

        if (newData?.error) {
          console.error("Error loading notifications:", newData.error);
          setNotifications([]);
          setTotalPages(1);
          setTotalRecords(0);
          setPage(1);
          return;
        }

        setNotifications(newData?.data || []);
        setPage(1);
        setTotalPages(newData?.totalPages || 1);
        setTotalRecords(newData?.totalRecords || 0);
        setUnreadCount(newData?.unreadCount || 0);
        prevPage1KeysRef.current = new Set((newData?.data || []).map(keyOf));
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error loading notifications:", error);
        }
      } finally {
        if (thisRequestId === requestIdRef.current) setIsPending(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [scope]);

  async function handleSeeMore() {
    if (isPending || page >= totalPages) return;
    setIsPending(true);
    const nextPage = page + 1;
    const thisRequestId = ++requestIdRef.current;

    try {
      const newData = await getInbox({ scope, page: nextPage });

      if (thisRequestId !== requestIdRef.current) return;

      if (newData?.error) {
        console.error("Error loading more notifications:", newData.error);
        return;
      }

      const incoming = newData?.data || [];

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
          <div className="flex rounded-lg bg-stone-200 p-1 w-fit">
            {scopeTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setScope(tab.value)}
                className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  scope === tab.value
                    ? "bg-primary-500 text-primary-foreground"
                    : "bg-stone-200 text-muted-foreground hover:text-primary-500"
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
            notifications={notifications}
            setNotifications={setNotifications}
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
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 sm:py-20 text-center">
          <Inbox className="size-8 text-stone-300" />
          <p className="text-sm font-medium text-stone-500">
            {scope === "requests"
              ? "No supervisor requests right now"
              : "You're all caught up"}
          </p>
          <p className="max-w-sm text-xs text-stone-400">
            {scope === "requests"
              ? "New requests from students will show up here."
              : "New approvals, announcements, and updates will show up here."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((item) => (
            <li key={item.ui_key} className="flex-1">
              <NotificationItem
                item={item}
                notifications={notifications}
                setNotifications={setNotifications}
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
            className="text-sm font-semibold text-stone-600 hover:text-primary-500 transition disabled:opacity-50"
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
          ? "border-primary-500 bg-primary-500 text-primary-foreground"
          : "border-stone-300 bg-white text-stone-800"
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
