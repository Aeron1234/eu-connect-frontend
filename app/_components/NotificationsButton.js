"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Award,
  Bell,
  CheckCircle2,
  ClipboardX,
  FileText,
  MapPin,
  Megaphone,
  Star,
  UserCheck,
  UserPlus,
  UserX,
  X,
  XCircle,
} from "lucide-react";
import { cx } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { socket } from "./SocketProvider";
import { toast } from "sonner";
import { toastAndAction } from "../../lib/helpers";
import {
  getInbox,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/server-actions/notifications-actions";
import {
  NOTIFICATIONS_CHANGED,
  notifyNotificationsChanged,
} from "@/lib/notification-events";

const TYPE_META = {
  announcement: { icon: Megaphone, tone: "violet" },
  internship_record_request: { icon: FileText, tone: "blue" },
  internship_record_approved: { icon: CheckCircle2, tone: "emerald" },
  internship_record_rejected: { icon: XCircle, tone: "red" },
  internship_record_finished: { icon: CheckCircle2, tone: "emerald" },
  internship_record_force_finished: { icon: CheckCircle2, tone: "emerald" },
  evaluation_submitted: { icon: Star, tone: "amber" },
  evaluation_deleted: { icon: ClipboardX, tone: "stone" },
  certificate_uploaded: { icon: Award, tone: "blue" },
  supervisor_request_submitted: { icon: UserPlus, tone: "violet" },
  supervisor_request_accepted: { icon: UserCheck, tone: "emerald" },
  supervisor_request_rejected: { icon: UserX, tone: "red" },
  dtr_location_set: { icon: MapPin, tone: "blue" },
};

const TONE_STYLES = {
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-blue-100 text-blue-600",
  violet: "bg-violet-100 text-violet-600",
  emerald: "bg-emerald-100 text-emerald-600",
  red: "bg-red-100 text-red-600",
  stone: "bg-muted text-muted-foreground",
};

function NotificationBell({ unreadCount, isOpen = false }) {
  return (
    <>
      <Bell
        className={`h-5 w-5 transition-colors ${isOpen ? "fill-primary-emphasis text-primary-emphasis" : ""}`}
        strokeWidth={isOpen ? 2.5 : 2}
      />
      {unreadCount > 0 && (
        <span className="pointer-events-none absolute right-0 top-0 -translate-x-1/3 translate-y-1/3 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white shadow-sm">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </>
  );
}

function NotificationsButton() {
  const [inbox, setInbox] = useState(() => ({
    notifications: [],
    unreadCount: 0,
  }));
  const { notifications, unreadCount } = inbox;
  const [showNotifications, setShowNotifications] = useState(false);
  const [inboxStatus, setInboxStatus] = useState("idle");
  const [deletingId, setDeletingId] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const dropdownRef = useRef(null);
  const requestIdRef = useRef(0);
  const countRequestIdRef = useRef(0);
  const [, startDeleteTransition] = useTransition();

  const refreshUnreadCount = useCallback(async () => {
    const requestId = ++countRequestIdRef.current;
    try {
      const fresh = await getUnreadNotificationCount();
      if (
        requestId !== countRequestIdRef.current ||
        !Number.isFinite(Number(fresh?.unreadCount))
      ) {
        return;
      }
      setInbox((current) => ({
        ...current,
        unreadCount: Math.max(0, Number(fresh.unreadCount)),
      }));
    } catch (error) {
      console.error("Could not refresh unread notification count:", error);
    }
  }, []);

  const refreshInbox = useCallback(async (showLoading = false) => {
    const requestId = ++requestIdRef.current;
    if (showLoading) setInboxStatus("loading");
    try {
      const fresh = await getInbox({ scope: "all", page: 1 });
      if (requestId !== requestIdRef.current) return false;
      if (!Array.isArray(fresh?.data)) {
        setInboxStatus((current) => current === "loading" ? "error" : current);
        return false;
      }
      countRequestIdRef.current += 1;
      setInbox({
        notifications: fresh.data,
        unreadCount: Math.max(0, Number(fresh.unreadCount) || 0),
      });
      setInboxStatus("ready");
      return true;
    } catch (error) {
      console.error("Could not refresh notification inbox:", error);
      if (requestId === requestIdRef.current) {
        setInboxStatus((current) => current === "loading" ? "error" : current);
      }
      return false;
    }
  }, []);

  // The badge needs only a count. The full inbox is read when the menu opens.
  useEffect(() => {
    void refreshUnreadCount();
    return () => {
      countRequestIdRef.current += 1;
      requestIdRef.current += 1;
    };
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (showNotifications) void refreshInbox(true);
  }, [showNotifications, refreshInbox]);

  // Socket payloads have no row ID. Refresh the open menu; otherwise keep
  // the badge current without querying the full notification list.
  useEffect(() => {
    let timer;
    const scheduleRefresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (showNotifications) void refreshInbox();
        else void refreshUnreadCount();
      }, 150);
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
  }, [showNotifications, refreshInbox, refreshUnreadCount]);

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    if (!showNotifications) return;

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    const tabletBreakpoint = window.matchMedia("(min-width: 768px)");
    const closeOnBreakpointChange = () => setShowNotifications(false);
    tabletBreakpoint.addEventListener("change", closeOnBreakpointChange);
    return () => {
      tabletBreakpoint.removeEventListener("change", closeOnBreakpointChange);
    };
  }, []);

  function toggleNotifications() {
    if (!showNotifications) setInboxStatus("loading");
    setShowNotifications((current) => !current);
  }

  async function handleMarkRead(id) {
    if (markingId !== null) return;
    setMarkingId(id);
    try {
      const result = await markAsRead(id);
      if (!result?.success) {
        toast.error(result?.error || "Could not mark notification as read.");
        return;
      }
      requestIdRef.current += 1;
      countRequestIdRef.current += 1;
      setInbox((current) => {
        const target = current.notifications.find(
          (notification) => String(notification.id) === String(id),
        );
        if (!target || target.is_read) return current;
        return {
          notifications: current.notifications.map((notification) =>
            String(notification.id) === String(id)
              ? { ...notification, is_read: true }
              : notification,
          ),
          unreadCount: Math.max(0, current.unreadCount - 1),
        };
      });
      notifyNotificationsChanged();
    } catch (error) {
      console.error("Could not mark notification as read:", error);
      toast.error("Could not mark notification as read.");
    } finally {
      setMarkingId(null);
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      const result = await markAllAsRead();
      if (!result?.success) {
        toast.error(result?.error || "Could not mark notifications as read.");
        return;
      }
      requestIdRef.current += 1;
      countRequestIdRef.current += 1;
      setInbox((current) => ({
        notifications: current.notifications.map((notification) =>
          notification.is_read
            ? notification
            : { ...notification, is_read: true },
        ),
        unreadCount: 0,
      }));
      notifyNotificationsChanged();
    } catch (error) {
      console.error("Could not mark notifications as read:", error);
      toast.error("Could not mark notifications as read.");
    } finally {
      setIsMarkingAll(false);
    }
  }

  function handleDismiss(id) {
    const formData = new FormData();
    formData.append("notificationId", id);

    setDeletingId(id);

    startDeleteTransition(async () => {
      try {
        const result = await toastAndAction({
          loadingLabel: "Deleting notification...",
          successLabel: "Notification deleted.",
          errorLabel: "Failed to delete notification.",
          action: deleteNotification,
          formData,
        });
        if (!result?.success) return;
        requestIdRef.current += 1;
        countRequestIdRef.current += 1;
        setInbox((current) => {
          const target = current.notifications.find(
            (notification) => String(notification.id) === String(id),
          );
          if (!target) return current;
          return {
            notifications: current.notifications.filter(
              (notification) => String(notification.id) !== String(id),
            ),
            unreadCount: Math.max(
              0,
              current.unreadCount - (target.is_read ? 0 : 1),
            ),
          };
        });
        notifyNotificationsChanged();
      } catch (error) {
        console.error("Could not delete notification:", error);
        toast.error("Could not delete notification.");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="relative z-50 flex items-center" ref={dropdownRef}>
      <Link
        href="/notifications"
        onClick={() => setShowNotifications(false)}
        aria-label="View notifications"
        title="Notifications"
        className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground-soft transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
      >
        <NotificationBell unreadCount={unreadCount} />
      </Link>

      <button
        type="button"
        className="group relative hidden size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-foreground-soft transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:inline-flex"
        onClick={toggleNotifications}
        aria-label="Toggle notifications menu"
        aria-expanded={showNotifications}
        aria-controls={showNotifications ? "notifications-menu" : undefined}
        title="Notifications"
      >
        <NotificationBell
          unreadCount={unreadCount}
          isOpen={showNotifications}
        />
      </button>

      {showNotifications && (
        <div
          id="notifications-menu"
          className="absolute top-full right-0 z-50 mt-2.5 hidden w-96 rounded-xl border border-border bg-card shadow-2xl md:block"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">
              Notifications
            </span>
            <div className="flex items-center gap-3">
              {inboxStatus === "ready" && unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAll}
                  className="text-xs font-semibold text-primary-emphasis hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div
            className="max-h-96 overflow-y-auto custom-scrollbar"
            aria-busy={inboxStatus === "loading"}
          >
            {inboxStatus === "loading" ? (
              <div role="status" aria-label="Loading notifications">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-0"
                  >
                    <Skeleton className="size-9 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2 py-0.5">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-2.5 w-1/3" />
                    </div>
                  </div>
                ))}
                <span className="sr-only">Loading notifications...</span>
              </div>
            ) : inboxStatus === "error" ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <p>Could not load notifications.</p>
                <button
                  type="button"
                  onClick={() => void refreshInbox(true)}
                  className="mt-2 font-semibold text-primary-emphasis hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => {
                const meta = TYPE_META[notif.type] ?? {
                  icon: FileText,
                  tone: "stone",
                };
                const Icon = meta.icon;

                return (
                  <div
                    key={notif.ui_key || notif.id}
                    className={cx(
                      "relative flex gap-3 border-b border-border/60 px-4 py-3 last:border-0 transition-colors",
                      notif.is_read ? "bg-card" : "bg-primary/10",
                    )}
                  >
                    <span
                      className={cx(
                        "grid size-9 shrink-0 place-items-center rounded-full",
                        TONE_STYLES[meta.tone],
                      )}
                    >
                      <Icon className="size-4.5" />
                    </span>

                    <div className="min-w-0 flex-1 pr-5">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        {notif.title}
                        {!notif.is_read && (
                          <span className="size-1.5 rounded-full bg-primary" />
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground/70">
                        <span>
                          {formatDistanceToNow(new Date(notif.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {!notif.is_read && (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(notif.id)}
                            disabled={markingId === notif.id}
                            className="font-semibold text-primary-emphasis hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDismiss(notif.id)}
                      disabled={deletingId === notif.id}
                      aria-label="Delete notification"
                      title="Delete notification"
                      className="absolute right-3 top-3 text-muted-foreground/60 transition hover:text-destructive disabled:opacity-50"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setShowNotifications(false)}
            className="block w-full border-t border-border px-4 py-3 text-center text-xs font-semibold text-primary-emphasis hover:underline"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationsButton;
