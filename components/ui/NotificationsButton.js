"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Award,
  ArrowUpRight,
  Bell,
  ChevronLeft,
  ChevronRight,
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
import { getNotificationTargetPath } from "@/lib/notification-routes";
import { Skeleton } from "@/components/ui/skeleton";
import { socket } from "./SocketProvider";
import { toast } from "sonner";
import { toastAndAction } from "../../lib/helpers";
import {
  getInboxResult as getInbox,
  getUnreadNotificationCountResult as getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/server-actions/notifications-actions";
import {
  NOTIFICATIONS_CHANGED,
  notifyNotificationsChanged,
} from "@/lib/notification-events";

const TYPE_META = {
  announcement: { icon: Megaphone, label: "Announcement" },
  internship_record_request: { icon: FileText, label: "Internship request" },
  internship_record_approved: { icon: CheckCircle2, label: "Internship update" },
  internship_record_rejected: { icon: XCircle, label: "Internship update" },
  internship_record_finished: { icon: CheckCircle2, label: "Internship update" },
  internship_record_force_finished: { icon: CheckCircle2, label: "Internship update" },
  evaluation_submitted: { icon: Star, label: "Evaluation" },
  evaluation_deleted: { icon: ClipboardX, label: "Evaluation" },
  certificate_uploaded: { icon: Award, label: "Document" },
  supervisor_request_submitted: { icon: UserPlus, label: "Supervisor request" },
  supervisor_request_accepted: { icon: UserCheck, label: "Supervisor request" },
  supervisor_request_rejected: { icon: UserX, label: "Supervisor request" },
  dtr_location_set: { icon: MapPin, label: "DTR location" },
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
    page: 1,
    totalPages: 1,
    totalRecords: 0,
  }));
  const { notifications, unreadCount, page, totalPages, totalRecords } = inbox;
  const [showNotifications, setShowNotifications] = useState(false);
  const [inboxStatus, setInboxStatus] = useState("idle");
  const [deletingId, setDeletingId] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const dropdownRef = useRef(null);
  const requestIdRef = useRef(0);
  const countRequestIdRef = useRef(0);
  const pageRef = useRef(1);
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
    } catch {
      // Keep the previous badge when the background count refresh fails.
    }
  }, []);

  const refreshInbox = useCallback(async (showLoading = false, targetPage = pageRef.current) => {
    const requestId = ++requestIdRef.current;
    pageRef.current = targetPage;
    if (showLoading) setInboxStatus("loading");
    try {
      let fresh = await getInbox({ scope: "all", page: targetPage });
      if (requestId !== requestIdRef.current) return false;
      if (!Array.isArray(fresh?.data)) {
        setInboxStatus((current) =>
          current === "loading" ? "error" : current,
        );
        return false;
      }
      const lastPage = Math.max(1, Number(fresh.totalPages) || 1);
      if (targetPage > lastPage) {
        targetPage = lastPage;
        fresh = await getInbox({ scope: "all", page: targetPage });
        if (requestId !== requestIdRef.current) return false;
        if (!Array.isArray(fresh?.data)) {
          setInboxStatus("error");
          return false;
        }
      }
      countRequestIdRef.current += 1;
      pageRef.current = targetPage;
      setInbox({
        notifications: fresh.data,
        unreadCount: Math.max(0, Number(fresh.unreadCount) || 0),
        page: targetPage,
        totalPages: Math.max(1, Number(fresh.totalPages) || 1),
        totalRecords: Math.max(0, Number(fresh.totalRecords) || 0),
      });
      setInboxStatus("ready");
      return true;
    } catch {
      if (requestId === requestIdRef.current) {
        setInboxStatus((current) =>
          current === "loading" ? "error" : current,
        );
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
    if (showNotifications) void refreshInbox(true, 1);
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
    if (!showNotifications) {
      pageRef.current = 1;
      setInboxStatus("loading");
    }
    setShowNotifications((current) => !current);
  }

  function handlePageChange(nextPage) {
    if (
      inboxStatus === "loading" ||
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page
    ) return;
    void refreshInbox(true, nextPage);
  }

  function handleOpenNotification(notif) {
    setShowNotifications(false);
    if (notif.is_read || notif.actionable) return;
    void markAsRead(notif.id).then((result) => {
      if (result?.success) notifyNotificationsChanged();
    });
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
          ...current,
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
        ...current,
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
            ...current,
            notifications: current.notifications.filter(
              (notification) => String(notification.id) !== String(id),
            ),
            unreadCount: Math.max(
              0,
              current.unreadCount - (target.is_read ? 0 : 1),
            ),
            totalRecords: Math.max(0, current.totalRecords - 1),
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
          className="absolute top-full right-0 z-50 mt-2 hidden w-[min(25rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:block"
        >
          <div className="relative overflow-hidden bg-primary px-4 py-3.5 text-white">
            <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full border-[24px] border-white/10" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Your inbox</p>
                <h2 className="mt-0.5 text-lg font-semibold tracking-tight">Notifications</h2>
                <p className="mt-0.5 text-xs text-white/75">
                  {unreadCount > 0
                    ? `${unreadCount} unread ${unreadCount === 1 ? "update" : "updates"}`
                    : "You’re all caught up"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                aria-label="Close notifications"
                className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/40 px-4 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Latest activity
            </span>
            {inboxStatus === "ready" && unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="text-xs font-semibold text-primary-emphasis transition hover:underline disabled:opacity-50"
              >
                {isMarkingAll ? "Marking…" : "Mark all read"}
              </button>
            )}
          </div>

          <div
            className="max-h-[min(20rem,calc(100vh-13rem))] min-h-28 overflow-y-auto custom-scrollbar"
            aria-busy={inboxStatus === "loading"}
          >
            {inboxStatus === "loading" ? (
              <div role="status" aria-label="Loading notifications">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="flex gap-2.5 border-b border-border/60 px-4 py-3 last:border-0"
                  >
                    <Skeleton className="size-8 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2 py-0.5">
                      <Skeleton className="h-2.5 w-1/3" />
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
                <span className="sr-only">Loading notifications...</span>
              </div>
            ) : inboxStatus === "error" ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <p>Could not load notifications.</p>
                <button
                  type="button"
                  onClick={() => void refreshInbox(true, pageRef.current)}
                  className="mt-2 font-semibold text-primary-emphasis hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length > 0 ? (
              <ul className="divide-y divide-border/70">
                {notifications.map((notif) => {
                  const meta = TYPE_META[notif.type] ?? {
                    icon: FileText,
                    label: "Update",
                  };
                  const Icon = meta.icon;
                  const destination = getNotificationTargetPath(notif) || "/notifications";

                  return (
                    <li
                      key={notif.ui_key || notif.id}
                      className={cx(
                        "relative transition-colors hover:bg-accent/60",
                        !notif.is_read && "bg-primary/5",
                      )}
                    >
                      {!notif.is_read && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-primary" />}
                      <Link
                        href={destination}
                        onClick={() => handleOpenNotification(notif)}
                        className="group block px-4 py-2.5 pr-18 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                        aria-label={`Open ${notif.title}`}
                      >
                        <span className="flex items-start gap-2.5">
                          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary-emphasis">
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-primary-emphasis">
                              {meta.label}
                            </span>
                            <span className="mt-0.5 block text-sm font-semibold leading-snug text-foreground line-clamp-2">
                              {notif.title}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground line-clamp-2">
                              {notif.message}
                            </span>
                            <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                              {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                              <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                            </span>
                          </span>
                        </span>
                      </Link>
                      <div className="absolute right-2 top-2 flex items-center gap-1">
                        {!notif.is_read && (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(notif.id)}
                            disabled={markingId === notif.id}
                            aria-label={`Mark ${notif.title} as read`}
                            title="Mark as read"
                            className="grid size-7 place-items-center rounded-md text-muted-foreground transition hover:bg-primary/10 hover:text-primary-emphasis disabled:opacity-50"
                          >
                            <CheckCircle2 className="size-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDismiss(notif.id)}
                          disabled={deletingId === notif.id}
                          aria-label={`Delete ${notif.title}`}
                          title="Delete notification"
                          className="grid size-7 place-items-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex min-h-28 flex-col items-center justify-center px-4 py-6 text-center">
                <Bell className="size-7 text-primary-emphasis/60" />
                <p className="mt-2 text-sm font-semibold text-foreground">Nothing here yet</p>
                <p className="mt-1 text-xs text-muted-foreground">New updates will appear in this inbox.</p>
              </div>
            )}
          </div>

          {inboxStatus === "ready" && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
              <span>{totalRecords} updates · Page {page} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => handlePageChange(page - 1)} disabled={page <= 1} aria-label="Previous notification page" className="grid size-7 place-items-center rounded-md transition hover:bg-accent disabled:opacity-40">
                  <ChevronLeft className="size-4" />
                </button>
                <button type="button" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} aria-label="Next notification page" className="grid size-7 place-items-center rounded-md transition hover:bg-accent disabled:opacity-40">
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          <Link href="/notifications" onClick={() => setShowNotifications(false)} className="flex items-center justify-between border-t border-border bg-secondary/40 px-4 py-2.5 text-xs font-semibold text-primary-emphasis transition hover:bg-secondary">
            Open notification center
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationsButton;
