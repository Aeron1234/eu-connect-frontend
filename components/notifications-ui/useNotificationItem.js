"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { toastAndAction } from "@/lib/helpers";
import { getNotificationTargetPath } from "@/lib/notification-routes";
import { markAsRead, deleteNotification } from "@/lib/server-actions/notifications-actions";
import useSupervisorRequestResponse from "@/lib/hooks/useSupervisorRequestResponse";
import { canDeleteNotification } from "@/lib/notification-permissions.mjs";
import { invalidateNotificationTarget, openAnnouncementFromNotification } from "./notificationActions";

export default function useNotificationItem(item, onChanged) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isOpeningAnnouncement, setIsOpeningAnnouncement] = useState(false);

  // Hide response actions only after a successful response; failures remain retryable.
  // The parent keys this item by actionable state, resetting the override on a server change.
  const [respondedOverride, setRespondedOverride] = useState(null);
  const isActionable = respondedOverride === false ? false : item.actionable;

  const { isPending, handleRespond } = useSupervisorRequestResponse({
    requestId: item.link_uuid || item.link, studentId: item.sender?.id,
    onSuccess: () => { setRespondedOverride(false); onChanged?.(); },
  });
  const canDelete = respondedOverride === false || canDeleteNotification(item);

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
      // Navigate without optimistically replacing the clicked card.
      // After a successful mark-read, refresh the inbox through onChanged.
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

  function handleDelete(e) {
    e.stopPropagation();
    if (!canDelete || isDeleting) return;

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
    isPending, isDeleting, isOpeningAnnouncement, isActionable, isClickable, canDelete,
    handleOpen, handleRespond, handleDelete,
  };
}
