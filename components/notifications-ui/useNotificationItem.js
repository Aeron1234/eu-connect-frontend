"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { toastAndAction } from "@/lib/helpers";
import { getNotificationTargetPath } from "@/lib/notification-routes";
import { markAsRead, deleteNotification } from "@/lib/server-actions/notifications-actions";
import { respondToSupervisorRequest } from "@/lib/server-actions/supervisor-actions";
import { invalidateNotificationTarget, openAnnouncementFromNotification } from "./notificationActions";

export default function useNotificationItem(item, onChanged) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isOpeningAnnouncement, setIsOpeningAnnouncement] = useState(false);

  // Hide response actions immediately after submitting, before the refresh.
  // The parent remounts this item when the server's actionable state changes.
  const [respondedOverride, setRespondedOverride] = useState(null);
  const isActionable = respondedOverride === false ? false : item.actionable;

  const targetPath = getNotificationTargetPath(item);
  const isClickable = !isActionable && (!item.is_read || Boolean(targetPath));

  function handleOpen() {
    if (isActionable) return;

    if (item.type === "announcement") {
      void handleOpenAnnouncement();
      return;
    }

    if (targetPath) {
      invalidateNotificationTarget(queryClient, user.id, item);
      // Skip the optimistic local re-render here — this page is about to
      // be unmounted by the navigation anyway, so there's nothing to
      // visually update. Mutating this card's DOM node (via updateItem)
      // in the same tick as router.push is what causes Next's "Cannot
      // read properties of undefined (reading 'startTime')" crash — a
      // known web-vitals/INP timing bug when the clicked element gets
      // removed before its interaction entry finishes being read.
      if (!item.is_read) {
        void markAsRead(item.id).then((result) => {
          if (result?.success) onChanged?.();
        });
      }
      router.push(targetPath);
      return;
    }

    if (!item.is_read) {
      void markAsRead(item.id).then((result) => {
        if (result?.success) onChanged?.();
      });
    }
  }

  async function handleOpenAnnouncement() {
    if (isOpeningAnnouncement) return;
    setIsOpeningAnnouncement(true);
    try {
      await openAnnouncementFromNotification(item.id, {
        onUnavailable: () => onChanged?.(),
        onOpen: (announcementId) => {
          router.push(`/announcements?announcement=${encodeURIComponent(announcementId)}`);
          window.setTimeout(() => onChanged?.(), 250);
        },
      });
    } finally {
      setIsOpeningAnnouncement(false);
    }
  }

  function handleRespond(decision) {
    const formData = new FormData();
    formData.append("requestId", item.link_uuid || item.link);
    formData.append("decision", decision);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel:
          decision === "accept"
            ? "Accepting request..."
            : "Declining request...",
        successLabel:
          decision === "accept" ? "Request accepted." : "Request declined.",
        errorLabel: "Failed to respond to request.",
        action: respondToSupervisorRequest,
        args: [formData],
      });

      if (result?.success) {
        setRespondedOverride(false);
        onChanged?.();
      }
    });
  }

  function handleDelete(e) {
    e.stopPropagation();

    const formData = new FormData();
    formData.append("notificationId", item.id);

    startDeleteTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Deleting notification...",
        successLabel: "Notification deleted.",
        errorLabel: "Failed to delete notification.",
        action: deleteNotification,
        args: [formData],
      });
      if (result?.success) onChanged?.();
    });
  }

  return {
    isPending, isDeleting, isOpeningAnnouncement, isActionable, isClickable,
    handleOpen, handleRespond, handleDelete,
  };
}
