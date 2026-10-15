"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { socket } from "../ui/SocketProvider";
import { toast } from "sonner";
import { toastAndAction } from "@/lib/helpers";
import { markAsRead, markAllAsRead, deleteNotification } from "@/lib/server-actions/notifications-actions";
import { NOTIFICATIONS_CHANGED, notifyNotificationsChanged } from "@/lib/notification-events";
import {
  notificationCountOptions, notificationInboxOptions, notificationsKeys,
  refreshNotificationQueries, updateNotificationInboxes,
} from "@/lib/cache/notifications-queries";
import { invalidateNotificationTarget, openAnnouncementFromNotification } from "./notificationActions";

export default function useNotificationsDropdown() {
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const dropdownRef = useRef(null);
  const [, startDeleteTransition] = useTransition();
  const countQuery = useQuery(notificationCountOptions(user.id));
  const inboxQuery = useInfiniteQuery({
    ...notificationInboxOptions(user.id),
    // Do not create the real inbox query until the dropdown is opened. This
    // also lets the notifications page seed it with its server-rendered data.
    queryKey: showNotifications
      ? notificationsKeys.inbox(user.id)
      : [...notificationsKeys.all(user.id), "closed-dropdown"],
    enabled: showNotifications,
  });
  const pages = inboxQuery.data?.pages ?? [];
  const currentPage = pages[page - 1];
  const notifications = currentPage?.data ?? [];
  const unreadCount = countQuery.data ?? pages[0]?.unreadCount ?? 0;
  const totalPages = Math.max(1, pages.at(-1)?.totalPages ?? 1);
  const totalRecords = pages[0]?.totalRecords ?? 0;
  const inboxStatus = inboxQuery.isPending || isLoadingPage
    ? "loading"
    : inboxQuery.isError && !inboxQuery.data
      ? "error"
      : "ready";

  useEffect(() => {
    if (page > Math.min(totalPages, Math.max(1, pages.length))) {
      setPage(Math.min(totalPages, Math.max(1, pages.length)));
    }
  }, [page, pages.length, totalPages]);

  // The badge fetches independently; the full inbox remains lazy until opened.
  useEffect(() => {
    let timer;
    const scheduleRefresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => refreshNotificationQueries(queryClient, user.id), 150);
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") scheduleRefresh();
    };
    const handleNewNotification = (notification) => {
      scheduleRefresh();
      invalidateNotificationTarget(queryClient, user.id, notification);
    };
    socket.on("new_notification", handleNewNotification);
    socket.on("connect", scheduleRefresh);
    window.addEventListener(NOTIFICATIONS_CHANGED, scheduleRefresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      clearTimeout(timer);
      socket.off("new_notification", handleNewNotification);
      socket.off("connect", scheduleRefresh);
      window.removeEventListener(NOTIFICATIONS_CHANGED, scheduleRefresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [queryClient, user.id]);

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
      setPage(1);
    }
    setShowNotifications((current) => !current);
  }

  async function handlePageChange(nextPage) {
    if (
      inboxStatus === "loading" ||
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page
    ) return;
    if (pages[nextPage - 1]) {
      setPage(nextPage);
      return;
    }
    setIsLoadingPage(true);
    try {
      const result = await inboxQuery.fetchNextPage();
      if (result.data?.pages[nextPage - 1]) setPage(nextPage);
      else toast.error("Could not load more notifications.");
    } finally {
      setIsLoadingPage(false);
    }
  }

  function handleOpenNotification(notif) {
    setShowNotifications(false);
    invalidateNotificationTarget(queryClient, user.id, notif);
    if (notif.is_read || notif.actionable) return;
    void markAsRead(notif.id).then((result) => {
      if (result?.success) notifyNotificationsChanged();
    });
  }

  async function handleAnnouncementClick(event, notif) {
    event.preventDefault();
    if (openingId !== null) return;
    setOpeningId(notif.id);
    try {
      await openAnnouncementFromNotification(notif.id, {
        onUnavailable: notifyNotificationsChanged,
        onOpen: (announcementId) => {
          setShowNotifications(false);
          router.push(`/announcements?announcement=${encodeURIComponent(announcementId)}`);
          window.setTimeout(notifyNotificationsChanged, 250);
        },
      });
    } finally {
      setOpeningId(null);
    }
  }

  function updateReadCache(id) {
    const target = notifications.find((item) => String(item.id) === String(id));
    if (!target || target.is_read) return;
    const nextCount = Math.max(0, unreadCount - 1);
    updateNotificationInboxes(queryClient, user.id, (inboxPage) => ({
      ...inboxPage,
      unreadCount: nextCount,
      data: inboxPage.data.map((item) =>
        String(item.id) === String(id) ? { ...item, is_read: true } : item,
      ),
    }));
    queryClient.setQueryData(notificationsKeys.count(user.id), nextCount);
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
      updateReadCache(id);
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
      updateNotificationInboxes(queryClient, user.id, (inboxPage) => ({
        ...inboxPage,
        unreadCount: 0,
        data: inboxPage.data.map((item) =>
          item.is_read ? item : { ...item, is_read: true },
        ),
      }));
      queryClient.setQueryData(notificationsKeys.count(user.id), 0);
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
        const target = notifications.find((item) => String(item.id) === String(id));
        if (target) {
          const nextCount = Math.max(0, unreadCount - (target.is_read ? 0 : 1));
          queryClient.setQueryData(notificationsKeys.count(user.id), nextCount);
          queryClient.setQueriesData(
            { queryKey: notificationsKeys.inboxes(user.id) },
            (old) => {
              if (!old?.pages?.length) return old;
              const includesTarget = old.pages.some((inboxPage) =>
                inboxPage.data.some((item) => String(item.id) === String(id)),
              );
              return {
                ...old,
                pages: old.pages.map((inboxPage) => ({
                  ...inboxPage,
                  unreadCount: nextCount,
                  totalRecords: Math.max(
                    0,
                    inboxPage.totalRecords - (includesTarget ? 1 : 0),
                  ),
                  data: inboxPage.data.filter((item) => String(item.id) !== String(id)),
                })),
              };
            },
          );
        }
        setPage(1);
        notifyNotificationsChanged();
      } catch (error) {
        console.error("Could not delete notification:", error);
        toast.error("Could not delete notification.");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return {
    dropdownRef, showNotifications, setShowNotifications, toggleNotifications, unreadCount,
    dropdownProps: {
      unreadCount, setShowNotifications, inboxStatus, handleMarkAllRead, isMarkingAll,
      inboxQuery, notifications, openingId, markingId, deletingId,
      handleAnnouncementClick, handleOpenNotification, handleMarkRead, handleDismiss,
      totalPages, totalRecords, page, handlePageChange,
    },
  };
}
