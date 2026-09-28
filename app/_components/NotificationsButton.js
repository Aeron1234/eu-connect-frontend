"use client";

import { useState, useEffect, useRef, useTransition } from "react";
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
import { socket } from "./SocketProvider";
import { toastAndAction } from "../../lib/helpers";
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/server-actions/notifications-actions";

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
  stone: "bg-stone-100 text-stone-500",
};

function NotificationsButton({
  inboxData: { data = [], unreadCount: initialCount = 0 } = {},
}) {
  const [notifications, setNotifications] = useState(data);
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const [showNotifications, setShowNotifications] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const dropdownRef = useRef(null);
  const [, startDeleteTransition] = useTransition();

  // 1. Sync state cleanly if server-side props re-fetch or change
  useEffect(() => {
    setNotifications(data);
    setUnreadCount(initialCount);
  }, [data, initialCount]);

  // 2. ISOLATED SOCKET LIFECYCLE: Set up listener exactly once on mount
  useEffect(() => {
    const handleNewNotification = (incoming) => {
      // NOTE: no socket.emit("new_notification", ...) call on the backend
      // currently sends the notification's own row id — only title/message/
      // type/link(_uuid). Falling back to link/link_uuid as the key here,
      // but that means "Mark read"/"Delete" on a live-arrived item (before
      // the next real fetch) has no guaranteed-correct id to send.
      const fallbackId =
        incoming.link_uuid || incoming.link || `live-${Date.now()}`;

      const newNotif = {
        id: fallbackId,
        type: incoming.type,
        title: incoming.title,
        message: incoming.message,
        is_read: false,
        created_at: new Date().toISOString(),
        ui_key: `${incoming.type}-${fallbackId}-${Date.now()}`,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, []);

  // 3. SEPARATED UI LIFECYCLE: Handle click outside clicks only when open
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

  function handleMarkRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    markAsRead(id);
  }

  function handleMarkAllRead() {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    markAllAsRead();
  }

  function handleDismiss(id) {
    const formData = new FormData();
    formData.append("notificationId", id);

    const previousNotifications = notifications;
    const target = notifications.find((n) => n.id === id);
    const wasUnread = target && !target.is_read;

    // Optimistic: remove immediately, restore the exact prior state on failure.
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
    setDeletingId(id);

    startDeleteTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Deleting notification...",
        successLabel: "Notification deleted.",
        errorLabel: "Failed to delete notification.",
        action: deleteNotification,
        formData,
      });

      if (!result?.success) {
        setNotifications(previousNotifications);
        if (wasUnread) setUnreadCount((prev) => prev + 1);
      }
      setDeletingId(null);
    });
  }

  return (
    <div className="relative inline-block h-full z-50" ref={dropdownRef}>
      <button
        className="group relative flex h-fit cursor-pointer hover:text-primary-500 transition-all"
        onClick={() => setShowNotifications((prev) => !prev)}
        title="Notifications"
      >
        <Bell
          className="h-6 w-6 transition-all"
          fill={showNotifications ? "#800000" : "#57534d"}
          stroke={showNotifications ? "#800000" : "#57534d"}
          strokeWidth={showNotifications ? 2.5 : 2}
        />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute bg-primary-500 px-1.5 py-0.5 rounded-full text-white font-bold text-[10px] top-0 right-0 translate-y-[-40%] translate-x-[30%] shadow-sm pointer-events-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 z-50 mt-2.5 w-96 rounded-xl border border-border bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">
              Notifications
            </span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-primary-500 hover:underline"
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

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
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
                      notif.is_read ? "bg-white" : "bg-primary-50/40",
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
                          <span className="size-1.5 rounded-full bg-primary-500" />
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
                            className="font-semibold text-primary-500 hover:underline"
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
            className="block w-full border-t border-border px-4 py-3 text-center text-xs font-semibold text-primary-500 hover:underline"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationsButton;
