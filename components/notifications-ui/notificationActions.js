"use client";

import { toast } from "sonner";
import { openAnnouncementNotification } from "@/lib/server-actions/notifications-actions";
import { userProfileKeys } from "@/lib/cache/user-profile-queries";

export function invalidateNotificationTarget(queryClient, userId, notification) {
  if ((notification?.type === "certificate_accepted" || notification?.type === "certificate_rejected") && notification.link_uuid) {
    void queryClient.invalidateQueries({
      queryKey: userProfileKeys.tab(userId, notification.link_uuid, "certificates"),
    });
  }
}

export async function openAnnouncementFromNotification(notificationId, { onUnavailable, onOpen }) {
  try {
    const result = await openAnnouncementNotification(notificationId);
    if (result.status === 410) {
      toast.info(result.error || "This announcement is no longer available.");
      onUnavailable?.();
      return;
    }
    if (!result.success || !result.announcementId) {
      toast.error(result.error || "Could not open this announcement.");
      return;
    }
    onOpen(result.announcementId);
  } catch (error) {
    console.error("Could not open announcement notification:", error);
    toast.error("Could not open this announcement. Please try again.");
  }
}
